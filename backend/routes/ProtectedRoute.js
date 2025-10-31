import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  // Wait for Redux state to initialize
  if (!user || !isAuthenticated) return <Navigate to="/login" replace />;

  // Admin not approved
  if (user.role === "admin" && !user.isApproved) {
    return <Navigate to="/pending-approval" replace />;
  }

  // Role not allowed → redirect to proper dashboard
  if (!allowedRoles.includes(user.role)) {
    if (user.role === "user") return <Navigate to="/user/dashboard" replace />;
    if (user.role === "admin") return <Navigate to="/admin/dashboard" replace />;
    if (user.role === "super-admin") return <Navigate to="/super-admin/dashboard" replace />;
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
