/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { logout } from "../redux/slices/authSlice";
import { toast } from "react-toastify";
import CreateUserForm from "../Pages/CreateUserForm";

const SuperAdminDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [pendingAdmins, setPendingAdmins] = useState([]);
  const [timeLeft, setTimeLeft] = useState({});
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUserFiles, setSelectedUserFiles] = useState([]);
  const [viewingUser, setViewingUser] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showFileModal, setShowFileModal] = useState(false);
  const [currentUserName, setCurrentUserName] = useState("");
  const [userFilter, setUserFilter] = useState("all"); // Filter for user type
  const [searchQuery, setSearchQuery] = useState(""); // New state for search

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (user?.role !== "super-admin") {
      navigate("/", { replace: true });
    } else {
      fetchPendingAdmins();
      fetchAllUsersAndAdmins();
      const autoRefresh = setInterval(fetchPendingAdmins, 10000);
      return () => clearInterval(autoRefresh);
    }
  }, [user, navigate]);

  /* ===============================
     PENDING ADMINS
  =============================== */
  const fetchPendingAdmins = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(
        "http://localhost:5000/api/super-admin/pending-admins",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPendingAdmins(res.data);

      const timers = {};
      res.data.forEach((admin) => {
        timers[admin._id] = getTimeLeft(admin.createdAt);
      });
      setTimeLeft(timers);
    } catch (err) {
      console.error("Error fetching pending admins", err);
    } finally {
      setIsLoading(false);
    }
  };

  const getTimeLeft = (createdAt) => {
    const expiry = new Date(createdAt).getTime() + 60 * 1000;
    const now = Date.now();
    const diff = expiry - now;
    return diff > 0 ? Math.floor(diff / 1000) : 0;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        const updated = {};
        pendingAdmins.forEach((admin) => {
          updated[admin._id] = getTimeLeft(admin.createdAt);
        });
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [pendingAdmins]);

  const handleApprove = async (id) => {
    try {
      await axios.put(
        `http://localhost:5000/api/super-admin/approve-admin/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Admin approved successfully");
      fetchPendingAdmins();
    } catch (err) {
      console.error(err);
      toast.error("Failed to approve admin");
    }
  };

  const handleReject = async (id) => {
    try {
      await axios.delete(
        `http://localhost:5000/api/super-admin/reject-admin/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Admin rejected successfully");
      fetchPendingAdmins();
    } catch (err) {
      console.error(err);
      toast.error("Failed to reject admin");
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  /* ===============================
     MANAGE USERS & ADMINS
  =============================== */
  const fetchAllUsersAndAdmins = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/super-admin/all-users-admins",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAllUsers(res.data);
    } catch (err) {
      console.error("Error fetching users/admins", err);
    }
  };

  const handleDeleteUserOrAdmin = async (id, role) => {
    try {
      await axios.delete(
        `http://localhost:5000/api/super-admin/delete/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`${role} deleted successfully`);
      fetchAllUsersAndAdmins();
    } catch (err) {
      console.error(`Error deleting ${role}`, err);
      toast.error(`Failed to delete ${role}`);
    }
  };

  const viewUserFiles = async (userId) => {
    try {
      setViewingUser(userId);
      const userName = allUsers.find((u) => u._id === userId)?.name || "User";
      setCurrentUserName(userName);

      const res = await axios.get(
        `http://localhost:5000/api/super-admin/files/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSelectedUserFiles(res.data);
      setShowFileModal(true);
    } catch (err) {
      console.error("Error fetching user files", err);
      toast.error("Failed to fetch user files");
    }
  };

  const handleDeleteFile = async (userId, fileId) => {
    try {
      await axios.delete(
        `http://localhost:5000/api/super-admin/files/${userId}/${fileId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("File deleted successfully");
      viewUserFiles(userId);
    } catch (err) {
      console.error("Error deleting file", err);
      toast.error("Failed to delete file");
    }
  };

  const handleDownloadFile = async (fileId, filename) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/files/download/${fileId}`,
        {
          responseType: "blob",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Error downloading file", err);
      toast.error("Failed to download file");
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login", { replace: true });
    toast.success("Logged Out");
  };

  const closeFileModal = () => {
    setShowFileModal(false);
    setViewingUser(null);
    setSelectedUserFiles([]);
    setCurrentUserName("");
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'super-admin': return 'from-purple-500 to-pink-500';
      case 'admin': return 'from-blue-500 to-cyan-500';
      case 'user': return 'from-green-500 to-emerald-500';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  };

  const getUserStats = () => {
    const totalUsers = allUsers.filter(u => u.role === 'user').length;
    const totalAdmins = allUsers.filter(u => u.role === 'admin' || u.role === 'super-admin').length;
    const pendingCount = pendingAdmins.length;
    
    return { totalUsers, totalAdmins, pendingCount };
  };

  // Filter and search users based on selected filter and search query
  const getFilteredAndSearchedUsers = () => {
    let filtered = allUsers;
    
    // Apply role filter
    if (userFilter === "user") {
      filtered = allUsers.filter(u => u.role === 'user');
    } else if (userFilter === "admin") {
      filtered = allUsers.filter(u => u.role === 'admin' || u.role === 'super-admin');
    }
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(u => 
        u.name.toLowerCase().includes(query) || 
        u.email.toLowerCase().includes(query) ||
        u.role.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  };

  // Clear search function
  const clearSearch = () => {
    setSearchQuery("");
  };

  const stats = getUserStats();
  const filteredUsers = getFilteredAndSearchedUsers();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 animate-slide-down">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl animate-pulse">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l14 9-14 9V3z" />
                </svg>
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white animate-bounce">
                <div className="w-2 h-2 bg-white rounded-full mx-auto mt-1"></div>
              </div>
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                Super Admin Dashboard
              </h1>
              <p className="text-gray-600 mt-2 text-lg">
                Welcome back, <span className="font-semibold text-purple-600">{user?.name}</span>
              </p>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="px-6 py-3 bg-white/90 backdrop-blur-sm hover:bg-red-50 border border-red-200 text-red-600 hover:text-red-700 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg font-medium flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Users Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 group p-6 border-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Users</p>
                <p className="text-3xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                  {stats.totalUsers}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm text-green-600">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <span>Active users</span>
            </div>
          </div>

          {/* Total Admins Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 group p-6 border-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Admins</p>
                <p className="text-3xl font-bold text-gray-900 group-hover:text-green-600 transition-colors duration-300">
                  {stats.totalAdmins}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm text-green-600">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Verified admins</span>
            </div>
          </div>

          {/* Pending Requests Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 group p-6 border-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Pending Requests</p>
                <p className="text-3xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors duration-300">
                  {stats.pendingCount}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm text-orange-600">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Awaiting approval</span>
            </div>
          </div>

          {/* Total Files Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 group p-6 border-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Files</p>
                <p className="text-3xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors duration-300">
                  {selectedUserFiles.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm text-purple-600">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Managed files</span>
            </div>
          </div>
        </div>

        {/* Create User Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border-0">
          <div className="p-6 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">User Management</h3>
                  <p className="text-gray-600 text-sm">Create and manage system users and administrators</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg font-medium flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                {showCreateForm ? 'Hide Form' : 'Create User/Admin'}
              </button>
            </div>
          </div>
          {showCreateForm && (
            <div className="p-6 animate-slide-down">
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
                <CreateUserForm role="super-admin" onSuccess={fetchAllUsersAndAdmins} />
              </div>
            </div>
          )}
        </div>

        {/* Pending Admin Requests */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border-0">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  Pending Admin Requests
                  <span className="px-3 py-1 bg-orange-100 text-orange-700 text-sm rounded-full font-medium animate-pulse">
                    {pendingAdmins.length} pending
                  </span>
                </h3>
                <p className="text-gray-600 text-sm">Review and approve admin registration requests with time limits</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                <span className="ml-2 text-gray-600">Loading requests...</span>
              </div>
            ) : pendingAdmins.length === 0 ? (
              <div className="text-center py-12 animate-fade-in">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-500 text-lg">No pending requests</p>
                <p className="text-gray-400 text-sm">All admin requests have been processed</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingAdmins.map((admin, index) => (
                  <div
                    key={admin._id}
                    className="group p-6 bg-gradient-to-r from-orange-50 via-red-50 to-pink-50 rounded-xl border border-orange-200 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] animate-slide-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-lg ring-2 ring-orange-200 group-hover:ring-orange-300 transition-all duration-300">
                          {getInitials(admin.name)}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-lg">{admin.name}</p>
                          <p className="text-gray-600">{admin.email}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm font-mono text-red-600 bg-red-100 px-2 py-1 rounded-full">
                              {formatTime(timeLeft[admin._id] || 0)}
                            </span>
                            <span className="text-xs text-gray-500">remaining</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleApprove(admin._id)}
                          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg font-medium flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(admin._id)}
                          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg font-medium flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Users and Admins Management with Search and Filter */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border-0">
          <div className="p-6 border-b border-gray-100">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      Manage Users & Admins
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full font-medium">
                        {filteredUsers.length} {searchQuery ? "found" : (userFilter === "all" ? "total" : userFilter + "s")}
                      </span>
                    </h3>
                    <p className="text-gray-600 text-sm">Search, filter, and manage users and administrators</p>
                  </div>
                </div>
                
                {/* Filter Dropdown */}
                <div className="relative">
                  <select
                    value={userFilter}
                    onChange={(e) => setUserFilter(e.target.value)}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 font-medium text-gray-700 min-w-[140px] appearance-none cursor-pointer"
                  >
                    <option value="all">All ({allUsers.length})</option>
                    <option value="user">Users ({stats.totalUsers})</option>
                    <option value="admin">Admins ({stats.totalAdmins})</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
              
              {/* Search Bar */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, email, or role..."
                  className="w-full pl-10 pr-12 py-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-700 placeholder-gray-400"
                />
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              
              {/* Search Results Info */}
              {searchQuery && (
                <div className="flex items-center gap-2 text-sm text-gray-600 bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
                  <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>
                    Found <strong>{filteredUsers.length}</strong> result{filteredUsers.length !== 1 ? 's' : ''} for "<strong>{searchQuery}</strong>"
                  </span>
                  {filteredUsers.length > 0 && (
                    <span className="text-blue-600">
                      in {userFilter === "all" ? "all users" : userFilter + "s"}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="p-6">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-12 animate-fade-in">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p className="text-gray-500 text-lg">
                  {searchQuery 
                    ? `No results found for "${searchQuery}"` 
                    : `No ${userFilter === "all" ? "users or admins" : userFilter + "s"} found`
                  }
                </p>
                {searchQuery && (
                  <div className="mt-4">
                    <button
                      onClick={clearSearch}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-300 transform hover:scale-105 font-medium"
                    >
                      Clear Search
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto space-y-3">
                {filteredUsers.map((user, index) => (
                  <div
                    key={user._id}
                    className="group p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] animate-slide-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 bg-gradient-to-br ${getRoleColor(user.role)} rounded-full flex items-center justify-center text-white font-bold text-lg ring-2 ring-gray-200 group-hover:ring-blue-300 transition-all duration-300`}>
                          {getInitials(user.name)}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-lg">
                            {searchQuery ? (
                              <span dangerouslySetInnerHTML={{
                                __html: user.name.replace(
                                  new RegExp(`(${searchQuery})`, 'gi'),
                                  '<mark class="bg-yellow-200 px-1 rounded">$1</mark>'
                                )
                              }} />
                            ) : (
                              user.name
                            )}
                          </p>
                          <p className="text-gray-600">
                            {searchQuery ? (
                              <span dangerouslySetInnerHTML={{
                                __html: user.email.replace(
                                  new RegExp(`(${searchQuery})`, 'gi'),
                                  '<mark class="bg-yellow-200 px-1 rounded">$1</mark>'
                                )
                              }} />
                            ) : (
                              user.email
                            )}
                          </p>
                          <span className={`inline-block px-3 py-1 bg-gradient-to-r ${getRoleColor(user.role)} text-white text-xs rounded-full mt-2 font-medium`}>
                            {searchQuery && user.role.toLowerCase().includes(searchQuery.toLowerCase()) ? (
                              <span dangerouslySetInnerHTML={{
                                __html: user.role.replace(
                                  new RegExp(`(${searchQuery})`, 'gi'),
                                  '<span class="bg-white/30 px-1 rounded">$1</span>'
                                )
                              }} />
                            ) : (
                              user.role
                            )}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {user.role === 'user' && (
                          <button
                            onClick={() => viewUserFiles(user._id)}
                            className="px-4 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-600 rounded-lg transition-all duration-300 transform hover:scale-105 font-medium flex items-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View Files
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteUserOrAdmin(user._id, user.role)}
                          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all duration-300 transform hover:scale-105 font-medium flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
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

      {/* File Management Modal */}
      {showFileModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden animate-scale-in">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Files by {currentUserName}</h3>
                    <p className="text-gray-600">Manage and download user files</p>
                  </div>
                </div>
                <button
                  onClick={closeFileModal}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                >
                  <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {selectedUserFiles.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-gray-500 text-lg">No files found</p>
                  <p className="text-gray-400 text-sm">This user hasn't uploaded any files yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedUserFiles.map((file, index) => (
                    <div
                      key={file._id}
                      className="group p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] animate-slide-up"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-gray-900 text-lg truncate" title={file.originalName}>
                            {file.originalName}
                          </p>
                          <p className="text-gray-600 text-sm">
                            {Math.round(file.size / 1024)} KB
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDownloadFile(file._id, file.originalName)}
                          className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all duration-300 transform hover:scale-105 font-medium flex items-center justify-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Download
                        </button>
                        <button
                          onClick={() => handleDeleteFile(viewingUser, file._id)}
                          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all duration-300 transform hover:scale-105 font-medium flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>{selectedUserFiles.length} files total</span>
                </div>
                <button
                  onClick={closeFileModal}
                  className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-all duration-300 transform hover:scale-105 font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slide-down {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.7s ease-out;
        }
        
        .animate-slide-down {
          animation: slide-down 0.5s ease-out;
        }
        
        .animate-slide-up {
          animation: slide-up 0.5s ease-out;
        }
        
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default SuperAdminDashboard;