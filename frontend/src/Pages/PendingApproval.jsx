import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import io from "socket.io-client";

const PENDING_WINDOW_SECS = 60;
const PENDING_WINDOW_MS = PENDING_WINDOW_SECS * 1000;
const POLL_INTERVAL_MS = 3000;

const PendingApproval = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [status, setStatus] = useState("waiting");
  const [timeLeft, setTimeLeft] = useState(PENDING_WINDOW_SECS);

  const handledRef = useRef(false);
  const timerRef = useRef(null);
  const pollRef = useRef(null);
  const socketRef = useRef(null);
  const navTimeoutRef = useRef(null);
  const mountedRef = useRef(true); // Track if component is still mounted

  const stopAll = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    if (navTimeoutRef.current) {
      clearTimeout(navTimeoutRef.current);
      navTimeoutRef.current = null;
    }
    if (socketRef.current) {
      socketRef.current.off("adminApproved");
      socketRef.current.off("adminRejected");
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  };

  useEffect(() => {
    // Reset mounted state when component mounts
    mountedRef.current = true;
    handledRef.current = false;

    if (!token) {
      navigate("/login");
      return;
    }

    let expiresAtMs = null;

    const computeExpiresAt = (createdAt) =>
      new Date(createdAt).getTime() + PENDING_WINDOW_MS;

    // countdown
    const startCountdown = () => {
      timerRef.current = setInterval(() => {
        // Check if component is still mounted and not handled
        if (!mountedRef.current || handledRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          return;
        }

        const remaining = Math.max(
          0,
          Math.floor((expiresAtMs - Date.now()) / 1000)
        );
        setTimeLeft(remaining);

        if (remaining <= 0 && !handledRef.current && mountedRef.current) {
          handledRef.current = true;
          stopAll();
          setStatus("timeout");
          toast.error("⌛ Request expired. Please signup again.", {
            autoClose: 2000,
          });
          navTimeoutRef.current = setTimeout(() => {
            if (mountedRef.current) {
              navigate("/signup", { replace: true });
            }
          }, 2000);
        }
      }, 1000);
    };

    const handleApproval = (msg) => {
      if (handledRef.current || !mountedRef.current) return;
      handledRef.current = true;
      stopAll();
      setStatus("approved");
      toast.success(msg || "✅ Approved!", { autoClose: 2000 });
      navTimeoutRef.current = setTimeout(() => {
        if (mountedRef.current) {
          navigate("/admin/dashboard", { replace: true });
        }
      }, 2000);
    };

    const handleRejection = (msg) => {
      if (handledRef.current || !mountedRef.current) return;
      handledRef.current = true;
      stopAll(); // ✅ stop timer so timeout never fires
      setStatus("rejected");
      toast.error(msg || "❌ Rejected!", { autoClose: 2000 });
      navTimeoutRef.current = setTimeout(() => {
        if (mountedRef.current) {
          navigate("/signup", { replace: true });
        }
      }, 2000);
    };

    const fetchUser = async () => {
      if (handledRef.current || !mountedRef.current) return;
      try {
        const res = await axios.get("http://localhost:5000/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const me = res.data;

        if (me.role !== "admin") {
          navigate("/login");
          return;
        }

        if (me.isApproved) {
          handleApproval();
        } else {
          if (!expiresAtMs) {
            expiresAtMs = computeExpiresAt(me.createdAt || Date.now());
            startCountdown();
          }
          if (!socketRef.current && mountedRef.current) {
            socketRef.current = io("http://localhost:5000", {
              transports: ["websocket"],
            });
            socketRef.current.emit("join", me._id);
            socketRef.current.on("adminApproved", (d) =>
              handleApproval(d.message)
            );
            socketRef.current.on("adminRejected", (d) =>
              handleRejection(d.message)
            );
          }
        }
      } catch (err) {
        if (mountedRef.current) {
          navigate("/login");
        }
      }
    };

    fetchUser();
    pollRef.current = setInterval(fetchUser, POLL_INTERVAL_MS);

    return () => {
      // Component is unmounting - mark as unmounted and clean up everything
      mountedRef.current = false;
      stopAll();
    };
  }, [navigate, token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white shadow-lg rounded-xl p-10 max-w-md text-center">
        {status === "waiting" && (
          <>
            <h2 className="text-2xl font-bold mb-4">⏳ Request Sent</h2>
            <p className="mb-2">
              Please wait while the Super Admin reviews your request...
            </p>
            <p className="text-sm text-gray-500">
              Time left: <span className="font-semibold">{timeLeft}s</span>
            </p>
          </>
        )}
        {status === "approved" && (
          <>
            <h2 className="text-2xl font-bold text-green-600 mb-4">✅ Approved</h2>
            <p>Redirecting to Admin Dashboard...</p>
          </>
        )}
        {status === "rejected" && (
          <>
            <h2 className="text-2xl font-bold text-red-600 mb-4">❌ Rejected</h2>
            <p>Redirecting back to signup...</p>
          </>
        )}
        {status === "timeout" && (
          <>
            <h2 className="text-2xl font-bold text-red-600 mb-4">⌛ Timeout</h2>
            <p>Your request expired. Please signup again.</p>
          </>
        )}
      </div>
    </div>
  );
};

export default PendingApproval;