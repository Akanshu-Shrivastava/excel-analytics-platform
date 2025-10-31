import React, { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import ChartPreview from "./ChartPreview";

const ChartConfigurator = () => {
  const { history } = useSelector((state) => state.uploadHistory);

  const [selectedFileId, setSelectedFileId] = useState("");
  const [xAxis, setXAxis] = useState("");
  const [yAxis, setYAxis] = useState("");

  const selectedFile = useMemo(() => {
    return history.find((file) => file._id === selectedFileId);
  }, [selectedFileId, history]);

  const columnOptions = useMemo(() => {
    if (!selectedFile || !selectedFile.data || selectedFile.data.length === 0) return [];
    return Object.keys(selectedFile.data[0]);
  }, [selectedFile]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!xAxis || !yAxis || !selectedFile) {
      alert("Please select a file and both X and Y axes.");
      return;
    }

    console.log("Chart Previewing with:", { xAxis, yAxis, data: selectedFile.data });
  };

  return (
    <div className="p-6 bg-white shadow-md rounded-md mt-6">
      <h2 className="text-xl font-bold mb-4">Chart Configurator</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Step 1: File Picker */}
        <div>
          <label className="block font-semibold mb-1">Select Uploaded File</label>
          <select
            value={selectedFileId}
            onChange={(e) => setSelectedFileId(e.target.value)}
            className="w-full border p-2 rounded"
          >
            <option value="">-- Choose File --</option>
            {history.map((file) => (
              <option key={file._id} value={file._id}>
                {file.originalFileName}
              </option>
            ))}
          </select>
        </div>

        {/* Step 2: Axis Selectors */}
        {selectedFile && (
          <>
            <div>
              <label className="block font-semibold mb-1">Select X Axis</label>
              <select
                value={xAxis}
                onChange={(e) => setXAxis(e.target.value)}
                className="w-full border p-2 rounded"
              >
                <option value="">-- Choose X Axis --</option>
                {columnOptions.map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-1">Select Y Axis</label>
              <select
                value={yAxis}
                onChange={(e) => setYAxis(e.target.value)}
                className="w-full border p-2 rounded"
              >
                <option value="">-- Choose Y Axis --</option>
                {columnOptions.map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Preview Chart
        </button>
      </form>

      {/* Render chart preview only if X, Y and data selected */}
      {xAxis && yAxis && selectedFile && (
        <ChartPreview
          xAxis={xAxis}
          yAxis={yAxis}
          data={selectedFile.data}
        />
      )}
    </div>
  );
};

export default ChartConfigurator;
