import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const PendingRequests = () => {
  const [pendingAdmins, setPendingAdmins] = useState([]);
  const token = localStorage.getItem("token");

  // ✅ Fetch pending admin requests
  const fetchPendingAdmins = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/super-admin/pending", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPendingAdmins(res.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch pending admins");
    }
  };

  // ✅ Approve request
  const handleApprove = async (id) => {
    try {
      await axios.put(
        `http://localhost:5000/api/super-admin/approve/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Admin approved successfully");
      setPendingAdmins(pendingAdmins.filter((u) => u._id !== id));
    } catch (error) {
      toast.error(error.response?.data?.message || "Approval failed");
    }
  };

  // ✅ Reject request
  const handleReject = async (id) => {
    if (!window.confirm("Are you sure you want to reject this request?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/super-admin/reject/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Admin request rejected");
      setPendingAdmins(pendingAdmins.filter((u) => u._id !== id));
    } catch (error) {
      toast.error(error.response?.data?.message || "Rejection failed");
    }
  };

  useEffect(() => {
    fetchPendingAdmins();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="bg-white shadow-xl rounded-lg p-6 max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold mb-6 text-gray-800">Pending Admin Requests</h2>

        {pendingAdmins.length === 0 ? (
          <p className="text-gray-500 text-center">✅ No pending requests right now.</p>
        ) : (
          <table className="w-full border-collapse border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 px-4 py-2 text-left">Name</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Email</th>
                <th className="border border-gray-300 px-4 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingAdmins.map((u) => (
                <tr key={u._id}>
                  <td className="border border-gray-300 px-4 py-2">{u.name}</td>
                  <td className="border border-gray-300 px-4 py-2">{u.email}</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    <button
                      onClick={() => handleApprove(u._id)}
                      className="bg-green-600 text-white px-3 py-1 rounded mr-2 hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(u._id)}
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default PendingRequests;
