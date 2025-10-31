// src/components/FileUpload.jsx
import React, { useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { fetchUploadHistory } from "../redux/uploadHistorySlice";
import { toast } from "react-toastify";

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");
  const dispatch = useDispatch();

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select a file");

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      await axios.post("http://localhost:5000/api/files/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("File Uploaded Successfully")

      setFile(null);
      dispatch(fetchUploadHistory()); // refresh history

      

    } catch (err) {
      console.error("Error uploading:", err);

      // Robust error handling
      const message =
        err.response && err.response.data && err.response.data.message
          ? err.response.data.message
          : "Failed to upload file";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <form onSubmit={handleUpload} className="mb-4 flex items-center gap-2">
        <input
          type="file"
          accept=".xlsx, .xls"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
        >
          {loading ? "Uploading..." : "Upload"}
        </button>
      </form>

      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
};

export default FileUpload;
