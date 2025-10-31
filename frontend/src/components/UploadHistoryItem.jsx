import React, { useState } from "react";
import ChartSelector from "./ChartSelector";
import ChartRenderer from "./ChartRenderer";

// ✅ Handle Excel file download
const handleDownload = async (fileId, filename) => {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(`http://localhost:5000/api/upload/download/${fileId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error("Failed to download file");

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Download failed:", err);
    alert("Download failed. See console for details.");
  }
};

const UploadHistoryItem = ({ file }) => {
  const [showChartTools, setShowChartTools] = useState(false);

  return (
    <li className="border p-4 rounded-lg bg-gray-50 shadow-sm">
      <p>
        <strong>File Name:</strong> {file.originalFileName}
      </p>
      <p>
        <strong>Uploaded At:</strong>{" "}
        {new Date(file.uploadedAt).toLocaleString()}
      </p>

      <div className="mt-2">
        <strong>Data Preview:</strong>
        <ul className="list-disc ml-5">
          {file.data.slice(0, 3).map((item, index) => (
            <li key={index}>
              Email: {item.Email}, Score: {item.Score}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-3 flex gap-2">
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={() => handleDownload(file._id, file.savedFileName)}
        >
          Download Excel
        </button>

        <button
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          onClick={() => setShowChartTools(!showChartTools)}
        >
          {showChartTools ? "Hide Chart Tools" : "Show Chart Tools"}
        </button>
      </div>

      {/* Chart tools & renderer */}
      {showChartTools && (
        <div className="mt-4 p-4 border-t border-gray-300">
          <ChartSelector fileId={file._id} fileData={file.data} />
          <ChartRenderer fileId={file._id} />
        </div>
      )}
    </li>
  );
};

export default UploadHistoryItem;
