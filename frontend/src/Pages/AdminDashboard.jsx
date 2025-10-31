import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { logout } from "../redux/slices/authSlice";
import { toast } from "react-toastify";
import {
  LogOut,
  UserCircle,
  Users,
  Download,
  Trash2,
  Eye,
  FileText,
  Calendar,
  Mail,
  Shield,
  X,
  Search,
  Filter,
} from "lucide-react";
import CreateUserForm from "../Pages/CreateUserForm";

const AdminDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserFiles, setSelectedUserFiles] = useState([]);
  const [profileModal, setProfileModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const token = localStorage.getItem("token");

  /* ====================
     FETCH USERS
  ==================== */
  useEffect(() => {
    if (user?.role !== "admin") {
      navigate("/", { replace: true });
    } else {
      fetchUsers();
    }
  }, [user, navigate]);

  useEffect(() => {
    // Filter out admins - only show regular users
    const regularUsers = users.filter((u) => u.role !== "admin");
    const filtered = regularUsers.filter(
      (u) =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [users, searchTerm]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        "http://localhost:5000/api/admin/manage-users",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUsers(res.data);
    } catch (err) {
      console.error("Error fetching users", err);
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  /* ====================
     DELETE USER
  ==================== */
  const confirmDelete = (user) => {
    setSelectedUser(user);
    setDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(
        `http://localhost:5000/api/admin/manage-users/${selectedUser._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("User deleted successfully");
      setDeleteModal(false);
      fetchUsers();
    } catch (err) {
      console.error("Error deleting user", err);
      toast.error("Failed to delete user");
    }
  };

  /* ====================
     VIEW USER PROFILE
  ==================== */
  const viewUserProfile = async (user) => {
    setSelectedUser(user);
    setProfileModal(true);

    try {
      const res = await axios.get(
        `http://localhost:5000/api/admin/files/${user._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSelectedUserFiles(res.data);
    } catch (err) {
      console.error("Error fetching user files", err);
      toast.error("Failed to fetch user files");
    }
  };

  /* ====================
     FILE ACTIONS
  ==================== */
  const handleDownloadFile = async (fileId, fileName) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/files/download/${fileId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Error downloading file", err);
      toast.error("Failed to download file");
    }
  };

  const handleDeleteFile = async (fileId) => {
    try {
      await axios.delete(
        `http://localhost:5000/api/admin/files/${selectedUser._id}/${fileId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("File deleted successfully");

      // ✅ Update state locally so UI refreshes
      setSelectedUserFiles((prevFiles) =>
        prevFiles.filter((file) => file._id !== fileId)
      );
    } catch (err) {
      console.error("Error deleting file", err);
      toast.error("Failed to delete file");
    }
  };

  /* ====================
     LOGOUT
  ==================== */
  const handleLogout = () => {
    dispatch(logout());
    navigate("/login", { replace: true });
    toast.success("Logged Out");
  };

  /* ====================
     RANDOM AVATAR
  ==================== */
  const getAvatar = (name) => {
    const colors = [
      "bg-gradient-to-br from-blue-500 to-blue-600",
      "bg-gradient-to-br from-green-500 to-green-600",
      "bg-gradient-to-br from-purple-500 to-purple-600",
      "bg-gradient-to-br from-pink-500 to-pink-600",
      "bg-gradient-to-br from-yellow-500 to-yellow-600",
      "bg-gradient-to-br from-red-500 to-red-600",
      "bg-gradient-to-br from-indigo-500 to-indigo-600",
      "bg-gradient-to-br from-teal-500 to-teal-600",
    ];
    const randomColor = colors[name.charCodeAt(0) % colors.length];
    return (
      <div
        className={`${randomColor} text-white w-12 h-12 flex items-center justify-center rounded-full font-bold text-lg shadow-lg transform transition-transform hover:scale-110`}
      >
        {name.charAt(0).toUpperCase()}
      </div>
    );
  };

  // Calculate stats for regular users only
  const regularUsersCount = users.filter((u) => u.role !== "admin").length;
  const activeUsersCount = users.filter(
    (u) => u.role === "user" && u.isApproved
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* ✅ Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-3 rounded-xl shadow-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Admin Dashboard
                </h1>
                <p className="text-gray-600 text-sm mt-1">
                  Manage users and system resources
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 
                         text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl
                         transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
            >
              <LogOut size={20} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ✅ Admin Info Card */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 mb-8 transform hover:scale-[1.02] transition-all duration-300">
          <div className="flex items-center gap-4">
            {/* Admin Avatar */}
            {user?.name && getAvatar(user.name)}
            <div>
              <p className="text-lg font-semibold text-gray-800">
                Welcome back,{" "}
                <span className="text-blue-600 font-bold">{user?.name}</span>
              </p>
              <p className="text-gray-600 text-sm">
                Administrator Access • User Management
              </p>
            </div>
          </div>
        </div>

        {/* ✅ Create User Form (Admins can only create regular users) */}
        <CreateUserForm role={user.role} onSuccess={fetchUsers} />

        {/* ✅ Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Users</p>
                <p className="text-3xl font-bold">{regularUsersCount}</p>
              </div>
              <Users className="w-12 h-12 text-blue-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">
                  Active Users
                </p>
                <p className="text-3xl font-bold">{activeUsersCount}</p>
              </div>
              <UserCircle className="w-12 h-12 text-green-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">
                  System Status
                </p>
                <p className="text-xl font-bold">Operational</p>
              </div>
              <Shield className="w-12 h-12 text-purple-200" />
            </div>
          </div>
        </div>

        {/* ✅ Search and Filter Section */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-600" />
              User Management
              <span className="text-sm font-normal text-gray-500">
                (Regular Users Only)
              </span>
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 w-full sm:w-64"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ✅ Users Table */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        User
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Email
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Joined
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td
                          colSpan="5"
                          className="px-6 py-12 text-center text-gray-500"
                        >
                          <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                          <p className="text-lg font-medium">No users found</p>
                          <p className="text-sm">
                            Try adjusting your search criteria
                          </p>
                        </td>
                      </tr>
                    ) : (
                      // eslint-disable-next-line no-unused-vars
                      filteredUsers.map((u, index) => (
                        <tr
                          key={u._id}
                          className="hover:bg-blue-50/50 transition-all duration-200 group"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              {getAvatar(u.name)}
                              <div>
                                <p className="font-semibold text-gray-800">
                                  {u.name}
                                </p>
                                <p className="text-sm text-gray-500">
                                  ID: {u._id.slice(-6)}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-700">{u.email}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                u.isApproved
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {u.isApproved ? "✅ Active" : "⏳ Pending"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-700 text-sm">
                                {new Date(u.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={() => viewUserProfile(u)}
                                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 
                                           text-white p-2 rounded-lg shadow-md hover:shadow-lg
                                           transition-all duration-300 transform hover:scale-110"
                                title="View Profile"
                              >
                                <Eye size={16} />
                              </button>
                              <button
                                onClick={() => confirmDelete(u)}
                                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 
                                           text-white p-2 rounded-lg shadow-md hover:shadow-lg
                                           transition-all duration-300 transform hover:scale-110"
                                title="Delete User"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden divide-y divide-gray-100">
                {filteredUsers.length === 0 ? (
                  <div className="px-6 py-12 text-center text-gray-500">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-lg font-medium">No users found</p>
                    <p className="text-sm">
                      Try adjusting your search criteria
                    </p>
                  </div>
                ) : (
                  filteredUsers.map((u) => (
                    <div
                      key={u._id}
                      className="p-6 hover:bg-blue-50/50 transition-all duration-200"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          {getAvatar(u.name)}
                          <div>
                            <p className="font-semibold text-gray-800">
                              {u.name}
                            </p>
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {u.email}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            u.isApproved
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {u.isApproved ? "✅ Active" : "⏳ Pending"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(u.createdAt).toLocaleDateString()}
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => viewUserProfile(u)}
                            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 
                                       text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg
                                       transition-all duration-300 transform hover:scale-105 text-sm"
                          >
                            View
                          </button>
                          <button
                            onClick={() => confirmDelete(u)}
                            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 
                                       text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg
                                       transition-all duration-300 transform hover:scale-105 text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ✅ Delete Confirmation Modal */}
      {deleteModal && selectedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform animate-in zoom-in-95 duration-300">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-red-100 p-3 rounded-full">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">
                    Confirm Deletion
                  </h3>
                  <p className="text-gray-600 text-sm">
                    This action cannot be undone
                  </p>
                </div>
              </div>
              <p className="mb-6 text-gray-700">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-red-600">
                  {selectedUser.name}
                </span>
                ? All associated data will be permanently removed.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteModal(false)}
                  className="flex-1 px-4 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 
                             text-gray-700 font-medium transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 
                             hover:from-red-600 hover:to-red-700 text-white font-medium
                             shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  Delete User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Profile Modal */}
      {profileModal && selectedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden transform animate-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {getAvatar(selectedUser.name)}
                  <div>
                    <h3 className="text-2xl font-bold">{selectedUser.name}</h3>
                    <p className="text-blue-100">User Profile & Files</p>
                  </div>
                </div>
                <button
                  onClick={() => setProfileModal(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {/* User Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <UserCircle className="w-5 h-5 text-gray-600" />
                    <span className="font-semibold text-gray-700">
                      Full Name
                    </span>
                  </div>
                  <p className="text-gray-800 font-medium">
                    {selectedUser.name}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="w-5 h-5 text-gray-600" />
                    <span className="font-semibold text-gray-700">
                      Email Address
                    </span>
                  </div>
                  <p className="text-gray-800 font-medium">
                    {selectedUser.email}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-5 h-5 text-gray-600" />
                    <span className="font-semibold text-gray-700">
                      Account Status
                    </span>
                  </div>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      selectedUser.isApproved
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {selectedUser.isApproved
                      ? "✅ Active"
                      : "⏳ Pending Approval"}
                  </span>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-5 h-5 text-gray-600" />
                    <span className="font-semibold text-gray-700">
                      Member Since
                    </span>
                  </div>
                  <p className="text-gray-800 font-medium">
                    {new Date(selectedUser.createdAt).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </p>
                </div>
              </div>

              {/* Files Section */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <FileText className="w-6 h-6 text-gray-700" />
                  <h4 className="text-xl font-bold text-gray-800">
                    Uploaded Files
                  </h4>
                  <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2 py-1 rounded-full">
                    {selectedUserFiles.length}
                  </span>
                </div>

                {selectedUserFiles.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg font-medium">
                      No files uploaded
                    </p>
                    <p className="text-gray-400 text-sm">
                      This user hasn't uploaded any files yet
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {selectedUserFiles.map((file) => (
                      <div
                        key={file._id}
                        className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="bg-blue-100 p-2 rounded-lg">
                              <FileText className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800">
                                {file.originalName}
                              </p>
                              <p className="text-sm text-gray-500">
                                Uploaded{" "}
                                {new Date(
                                  file.uploadedAt || file.createdAt
                                ).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                handleDownloadFile(file._id, file.originalName)
                              }
                              className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 
                                         hover:from-green-600 hover:to-green-700 text-white px-4 py-2 rounded-lg
                                         shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                            >
                              <Download size={16} />
                              <span className="hidden sm:inline">Download</span>
                            </button>
                            <button
                              onClick={() => handleDeleteFile(file._id)}
                              className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 
                                         hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg
                                         shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                            >
                              <Trash2 size={16} />
                              <span className="hidden sm:inline">Delete</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
