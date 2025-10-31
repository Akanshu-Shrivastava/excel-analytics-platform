import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useParams,
} from "react-router-dom";
import Login from "./Pages/Login";
import Signup from "./Pages/Signup";
import UserDashboard from "./Pages/UserDashboard";
import AdminDashboard from "./Pages/AdminDashboard";
import SuperAdminDashboard from "./Pages/SuperAdminDashboard";
import PendingApproval from "./Pages/PendingApproval";
import ChartRenderer from "./components/charts/ChartRenderer";
import LandingPage from "./Pages/LandingPage"; // ✅ Added Landing Page
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// ✅ ProtectedRoute wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// ✅ Wrapper for ChartRenderer to extract fileId from URL params
const ChartRendererWrapper = () => {
  const { fileId } = useParams();
  return <ChartRenderer fileId={fileId} />;
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          {/* Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* User Dashboard */}
          <Route
            path="/user/dashboard"
            element={
              <ProtectedRoute allowedRoles={["user"]}>
                <UserDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/dashboard/charts/:fileId"
            element={
              <ProtectedRoute allowedRoles={["user"]}>
                <ChartRendererWrapper />
              </ProtectedRoute>
            }
          />

          {/* Admin Dashboard */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Super Admin Dashboard */}
          <Route
            path="/superadmin/dashboard"
            element={
              <ProtectedRoute allowedRoles={["super-admin"]}>
                <SuperAdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Pending Approval */}
          <Route path="/pending-approval" element={<PendingApproval />} />

          {/* Default Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* ✅ Global Toast Notifications */}
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </Router>
  );
}

export default App;
