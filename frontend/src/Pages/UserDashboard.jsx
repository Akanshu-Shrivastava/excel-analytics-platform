// src/Pages/UserDashboard.jsx
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { io } from "socket.io-client";

import FileUpload from "../components/FileUpload";
import ChartRenderer from "../components/charts/ChartRenderer";
import { logout } from "../redux/slices/authSlice";
import {
  fetchUploadHistory,
  deleteFileThunk,
} from "../redux/uploadHistorySlice";

const socket = io("http://localhost:5000"); // ✅ Connect to backend

const UserDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const { uploadHistory, loading, error } = useSelector(
    (state) => state.uploadHistory
  );
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [selectedFileId, setSelectedFileId] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [showParsedTable, setShowParsedTable] = useState(false);
  const [activeTab, setActiveTab] = useState("upload");

  // AI Summary state
  const [aiSummary, setAiSummary] = useState("");
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);

  // Redirect if not user
  useEffect(() => {
    if (!user) return;
    if (user.role !== "user") navigate("/login", { replace: true });
  }, [user, navigate]);

  // Fetch upload history
  useEffect(() => {
    if (user) dispatch(fetchUploadHistory());
  }, [user, dispatch]);

  // ✅ Setup socket for real-time file deletion
  useEffect(() => {
    if (user?._id) {
      socket.emit("join", user._id);

      socket.on("fileDeleted", ({ fileId }) => {
        dispatch({
          type: "uploadHistory/removeFile",
          payload: fileId,
        });

        if (selectedFileId === fileId) {
          setSelectedFileId(null);
          setParsedData(null);
          setShowParsedTable(false);
        }

        toast.info("A file was deleted by admin ❌");
      });
    }

    return () => {
      socket.off("fileDeleted");
    };
  }, [user, dispatch, selectedFileId]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login", { replace: true });
    toast.info("Logged out successfully 👋");
  };

  // 📜 Parse file
  const parseFile = async (fileId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `http://localhost:5000/api/files/parsed/${fileId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setParsedData(res.data.data);
      setShowParsedTable(true);
      setActiveTab("visualize");
      toast.success("File parsed successfully!");
    } catch (err) {
      toast.error("Failed to parse file");
      console.error("Parse error:", err);
    }
  };

  // ⬇️ Download file
  const downloadFile = async (fileId) => {
    try {
      const token = localStorage.getItem("token");
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
      link.setAttribute("download", "file.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success("Download started...");
    } catch (err) {
      toast.error("Failed to download file");
      console.error("Download error:", err);
    }
  };

  // 🗑️ Delete file
  const deleteFile = (fileId) => {
    dispatch(deleteFileThunk(fileId));
    if (selectedFileId === fileId) {
      setSelectedFileId(null);
      setParsedData(null);
      setShowParsedTable(false);
    }
  };

  // 🤖 Generate AI Summary
  const generateAISummary = async (fileId) => {
    try {
      setLoadingSummary(true);
      setShowSummaryModal(true);
      setAiSummary("");

      const token = localStorage.getItem("token");

      const res = await axios.post(
        `http://localhost:5000/api/files/summary/${fileId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log(res.data)
      setAiSummary(res.data.insights);
    } catch (err) {
      console.error("AI summary error:", err);
      toast.error("Failed to generate AI summary");
      setAiSummary("Error: Could not generate summary.");
    } finally {
      setLoadingSummary(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full opacity-10 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 20}s`,
              animationDuration: `${20 + Math.random() * 10}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden mb-8 group hover:bg-white/15 transition-all duration-500">
            <div className="bg-gradient-to-r from-blue-600/80 via-purple-600/80 to-pink-600/80 p-8 relative overflow-hidden">
              {/* Header Background Animation */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center">
                <div className="text-center lg:text-left">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                      <i className="fas fa-chart-line text-2xl text-white"></i>
                    </div>
                    <div>
                      <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight">
                        Dashboard
                      </h1>
                      <div className="flex items-center gap-2 text-white/90">
                        <i className="fas fa-sparkles text-yellow-300"></i>
                        <span className="text-lg">Welcome back, </span>
                        <span className="font-bold text-yellow-300">{user?.name}</span>
                        <i className="fas fa-crown text-yellow-300 ml-2"></i>
                      </div>
                    </div>
                  </div>
                  <p className="text-white/80 text-lg">
                    Manage your data with powerful analytics and insights
                  </p>
                </div>
                
                <div className="mt-6 lg:mt-0 flex items-center space-x-4">
                  <div className="flex items-center gap-3">
                    <div className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
                      <span className="text-white font-medium capitalize flex items-center gap-2">
                        <i className="fas fa-user-circle"></i>
                        {user?.role}
                      </span>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="group/btn px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white hover:text-purple-600 transition-all duration-300 font-medium border border-white/30 hover:border-white hover:shadow-xl hover:scale-105"
                    >
                      <i className="fas fa-sign-out-alt mr-2 group-hover/btn:rotate-12 transition-transform duration-300"></i>
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-xl mb-8 overflow-hidden">
            <div className="flex overflow-x-auto">
              {[
                { id: "upload", icon: "fas fa-cloud-upload-alt", label: "Upload File", color: "blue" },
                { id: "history", icon: "fas fa-history", label: "File History", color: "purple" },
                { id: "visualize", icon: "fas fa-chart-bar", label: "Visualize Data", color: "pink" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative px-8 py-6 font-semibold text-base transition-all duration-300 flex-1 min-w-max group ${
                    activeTab === tab.id
                      ? "text-white"
                      : "text-white/70 hover:text-white"
                  }`}
                >
                  {/* Active Tab Background */}
                  {activeTab === tab.id && (
                    <div className={`absolute inset-0 bg-gradient-to-r ${
                      tab.color === 'blue' ? 'from-blue-500 to-cyan-500' :
                      tab.color === 'purple' ? 'from-purple-500 to-indigo-500' :
                      'from-pink-500 to-rose-500'
                    } animate-slideIn`}></div>
                  )}
                  
                  {/* Tab Content */}
                  <div className="relative z-10 flex items-center justify-center gap-3">
                    <i className={`${tab.icon} text-xl group-hover:scale-110 transition-transform duration-300`}></i>
                    <span className="hidden md:block">{tab.label}</span>
                  </div>
                  
                  {/* Hover Effect */}
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-8 min-h-[600px]">
            {/* Upload Section */}
            {activeTab === "upload" && (
              <div className="animate-slideInUp">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl mb-6 shadow-xl">
                    <i className="fas fa-cloud-upload-alt text-3xl text-white"></i>
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-3">Upload Your File</h2>
                  <p className="text-white/70 text-lg">Drag and drop or select files to analyze</p>
                </div>
                <div className="max-w-2xl mx-auto">
                  <FileUpload />
                </div>
              </div>
            )}

            {/* History Section */}
            {activeTab === "history" && (
              <div className="animate-slideInUp">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-3xl mb-6 shadow-xl">
                    <i className="fas fa-history text-3xl text-white"></i>
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-3">Upload History</h2>
                  <p className="text-white/70 text-lg">Manage your previously uploaded files</p>
                </div>

                {loading && (
                  <div className="flex justify-center items-center h-40">
                    <div className="relative">
                      <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                      <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-500 rounded-full animate-spin animate-reverse"></div>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="bg-red-500/20 backdrop-blur-sm border border-red-500/30 text-red-100 p-6 rounded-2xl mb-6 animate-shake">
                    <i className="fas fa-exclamation-triangle mr-3"></i>
                    {error}
                  </div>
                )}

                {uploadHistory && uploadHistory.length === 0 && !loading && (
                  <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/10">
                    <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                      <i className="fas fa-folder-open text-4xl text-white/50"></i>
                    </div>
                    <p className="text-white/70 text-xl mb-4">No files uploaded yet</p>
                    <p className="text-white/50">Start by uploading your first file</p>
                  </div>
                )}

                {uploadHistory && uploadHistory.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {uploadHistory.map((file, index) => (
                      <div
                        key={file._id}
                        className="group bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden hover:bg-white/15 hover:border-white/30 transition-all duration-500 hover:scale-105 hover:shadow-2xl animate-slideInUp"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="p-6 border-b border-white/10">
                          <div className="flex items-center">
                            <div className="bg-gradient-to-br from-emerald-400 to-cyan-400 p-4 rounded-2xl mr-4 group-hover:scale-110 transition-transform duration-300">
                              <i className="fas fa-file-excel text-white text-2xl"></i>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-white text-lg truncate group-hover:text-cyan-300 transition-colors duration-300">
                                {file.originalName}
                              </h3>
                              {/* <p className="text-white/60 text-sm flex items-center gap-2 mt-1">
                                <i className="fas fa-calendar-alt"></i>
                                {new Date(file.uploadDate).toLocaleDateString()}
                              </p> */}
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-4 bg-white/5 flex justify-center flex-wrap gap-2">
                          {[
                            { action: () => parseFile(file._id), icon: "fas fa-table", color: "emerald", title: "Parse file" },
                            { action: () => { setSelectedFileId(file._id); setActiveTab("visualize"); }, icon: "fas fa-chart-bar", color: "blue", title: "Visualize data" },
                            { action: () => downloadFile(file._id), icon: "fas fa-download", color: "purple", title: "Download file" },
                            { action: () => generateAISummary(file._id), icon: "fas fa-robot", color: "indigo", title: "AI Summary" },
                            { action: () => deleteFile(file._id), icon: "fas fa-trash", color: "red", title: "Delete file" }
                          ].map((btn, i) => (
                            <button
                              key={i}
                              onClick={btn.action}
                              className={`p-3 rounded-xl transition-all duration-300 hover:scale-110 hover:shadow-lg group/btn bg-${btn.color}-500/20 hover:bg-${btn.color}-500/30 text-${btn.color}-300 hover:text-white border border-${btn.color}-500/30`}
                              title={btn.title}
                            >
                              <i className={`${btn.icon} group-hover/btn:animate-pulse`}></i>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Visualization Section */}
            {activeTab === "visualize" && (
              <div className="animate-slideInUp">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-pink-500 to-rose-500 rounded-3xl mb-6 shadow-xl">
                    <i className="fas fa-chart-area text-3xl text-white"></i>
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-3">Data Visualization</h2>
                  <p className="text-white/70 text-lg">Transform your data into insights</p>
                </div>

                {/* Parsed Data Table */}
                {showParsedTable && parsedData && (
                  <div className="mb-8 animate-slideInUp">
                    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden">
                      <div className="flex justify-between items-center p-6 border-b border-white/10">
                        <h3 className="text-xl font-bold text-white flex items-center gap-3">
                          <i className="fas fa-table text-cyan-400"></i>
                          Parsed Data Preview
                        </h3>
                        <button
                          onClick={() => setShowParsedTable(false)}
                          className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300"
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="min-w-full">
                          <thead className="bg-white/5">
                            <tr>
                              {Object.keys(parsedData[0] || {}).map((key) => (
                                <th
                                  key={key}
                                  className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider"
                                >
                                  {key}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/10">
                            {parsedData.slice(0, 5).map((row, idx) => (
                              <tr key={idx} className="hover:bg-white/5 transition-colors duration-200">
                                {Object.values(row).map((val, i) => (
                                  <td
                                    key={i}
                                    className="px-6 py-4 whitespace-nowrap text-sm text-white/80"
                                  >
                                    {val}
                                  </td>
                                ))}
                              </tr>
                            ))}
                            {parsedData.length > 5 && (
                              <tr>
                                <td
                                  colSpan={Object.keys(parsedData[0] || {}).length}
                                  className="px-6 py-4 text-center text-sm text-white/60 bg-white/5"
                                >
                                  Showing first 5 rows of {parsedData.length} total rows
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* Chart Renderer */}
                {selectedFileId && (
                  <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 animate-slideInUp">
                    <ChartRenderer fileId={selectedFileId} />
                  </div>
                )}

                {!selectedFileId && !showParsedTable && (
                  <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/10">
                    <div className="w-24 h-24 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                      <i className="fas fa-chart-area text-3xl text-white"></i>
                    </div>
                    <p className="text-white/70 text-xl mb-4">Ready to visualize your data</p>
                    <p className="text-white/50 mb-6">Select a file from your history to get started</p>
                    <button
                      onClick={() => setActiveTab("history")}
                      className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl hover:from-pink-600 hover:to-purple-600 transition-all duration-300 font-semibold shadow-xl hover:shadow-2xl hover:scale-105"
                    >
                      <i className="fas fa-folder-open mr-2"></i>
                      Browse Files
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Summary Modal */}
      {showSummaryModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl w-full max-w-2xl relative animate-modalSlideIn">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center">
                    <i className="fas fa-robot text-white text-xl"></i>
                  </div>
                  <h2 className="text-2xl font-bold text-white">AI Summary</h2>
                </div>
                <button
                  onClick={() => setShowSummaryModal(false)}
                  className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>
              
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10 min-h-[200px]">
                {loadingSummary ? (
                  <div className="flex flex-col items-center justify-center h-40">
                    <div className="relative mb-4">
                      <div className="w-12 h-12 border-4 border-white/20 border-t-indigo-500 rounded-full animate-spin"></div>
                    </div>
                    <p className="text-white/70">Generating AI summary...</p>
                  </div>
                ) : (
                  <div className="text-white/90 whitespace-pre-line leading-relaxed">
                    {aiSummary}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Font Awesome */}
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
      />

      {/* Enhanced Animations */}
      <style>
        {`
          @keyframes blob {
            0% { transform: translate(0px, 0px) scale(1); }
            33% { transform: translate(30px, -50px) scale(1.1); }
            66% { transform: translate(-20px, 20px) scale(0.9); }
            100% { transform: translate(0px, 0px) scale(1); }
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
          
          @keyframes slideInUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          @keyframes slideIn {
            from { opacity: 0; transform: scaleX(0); }
            to { opacity: 1; transform: scaleX(1); }
          }
          
          @keyframes modalSlideIn {
            from { opacity: 0; transform: scale(0.9) translateY(20px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
          }
          
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
            20%, 40%, 60%, 80% { transform: translateX(2px); }
          }
          
          .animate-blob { animation: blob 7s infinite; }
          .animate-float { animation: float 6s ease-in-out infinite; }
          .animate-slideInUp { animation: slideInUp 0.6s ease-out; }
          .animate-slideIn { animation: slideIn 0.3s ease-out; }
          .animate-modalSlideIn { animation: modalSlideIn 0.4s ease-out; }
          .animate-shake { animation: shake 0.5s ease-in-out; }
          .animate-reverse { animation-direction: reverse; }
          
          .animation-delay-2000 { animation-delay: 2s; }
          .animation-delay-4000 { animation-delay: 4s; }
        `}
      </style>
    </div>
  );
};

export default UserDashboard;