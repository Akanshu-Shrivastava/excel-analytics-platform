import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const UploadHistory = () => {
  const [files, setFiles] = useState([]);
  const [parsedData, setParsedData] = useState(null);
  const [aiSummary, setAiSummary] = useState(null);
  const [loadingId, setLoadingId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // Fetch history
  const fetchHistory = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/files/history", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFiles(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch history");
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Parse file
  const handleParse = async (id) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/files/parsed/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setParsedData(res.data.data);
      toast.success("File parsed successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to parse file");
    }
  };

  // View charts
  const handleViewCharts = (id) => {
    navigate(`/user/dashboard/charts/${id}`);
  };

  // Download file
  const handleDownload = async (id) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/files/download/${id}`,
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

      toast.success("Download started");
    } catch (err) {
      console.error(err);
      toast.error("Failed to download file");
    }
  };

  // Delete file
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/files/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("File deleted successfully");
      fetchHistory(); // refresh list
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete file");
    }
  };

  // AI Summary
  const handleAISummary = async (id) => {
    try {
      setLoadingId(id);
      setShowModal(true);
      setAiSummary(null);

      const res = await axios.post(
        `http://localhost:5000/api/files/summary/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAiSummary(res.data.summary);
      toast.success("AI Summary generated!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate AI Summary");
      setShowModal(false);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="mt-6 p-6 bg-white shadow rounded-lg">
      <h3 className="text-xl font-semibold mb-4">Upload History</h3>
      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">File Name</th>
            <th className="border p-2">Size (KB)</th>
            <th className="border p-2">Uploaded At</th>
            <th className="border p-2">Actions</th>
            <th className="border p-2">AI Summary</th>
          </tr>
        </thead>
        <tbody>
          {files.map((file) => (
            <tr key={file._id}>
              <td className="border p-2">{file.originalName}</td>
              <td className="border p-2">{(file.size / 1024).toFixed(2)}</td>
              <td className="border p-2">
                {new Date(file.createdAt).toLocaleString()}
              </td>
              <td className="border p-2 space-x-2">
                <button
                  onClick={() => handleParse(file._id)}
                  className="px-2 py-1 bg-green-600 text-white rounded"
                >
                  Parse
                </button>
                <button
                  onClick={() => handleViewCharts(file._id)}
                  className="px-2 py-1 bg-blue-600 text-white rounded"
                >
                  View Charts
                </button>
                <button
                  onClick={() => handleDownload(file._id)}
                  className="px-2 py-1 bg-yellow-600 text-white rounded"
                >
                  Download
                </button>
                <button
                  onClick={() => handleDelete(file._id)}
                  className="px-2 py-1 bg-red-600 text-white rounded"
                >
                  Delete
                </button>
              </td>
              <td className="border p-2">
                <button
                  onClick={() => handleAISummary(file._id)}
                  disabled={loadingId === file._id}
                  className="px-2 py-1 bg-purple-600 text-white rounded w-full"
                >
                  {loadingId === file._id ? "Summarizing..." : "Generate Summary"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Parsed Data Table */}
      {parsedData && (
        <div className="mt-6">
          <h4 className="text-lg font-semibold mb-2">Parsed Data</h4>
          <table className="w-full border-collapse border">
            <thead>
              <tr>
                {Object.keys(parsedData[0] || {}).map((key) => (
                  <th key={key} className="border p-2">
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {parsedData.map((row, i) => (
                <tr key={i}>
                  {Object.values(row).map((val, j) => (
                    <td key={j} className="border p-2">
                      {val}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* AI Summary Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
            <h3 className="font-bold text-lg mb-2">📊 AI Summary</h3>
            {loadingId ? (
              <p className="text-gray-500">Generating summary...</p>
            ) : (
              <p className="text-gray-700 whitespace-pre-line">{aiSummary}</p>
            )}
            <button
              onClick={() => setShowModal(false)}
              className="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadHistory;
