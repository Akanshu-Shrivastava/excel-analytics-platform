// src/components/ChartSelector.jsx
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
} from "chart.js";
import { Pie, Line, Bar } from "react-chartjs-2";

import BarChart3D from "../charts/BarChart3D";
import PieChart3D from "../charts/PieChart3D";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement
);

function ChartSelector({ fileData }) {
  const { fileId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [chartType, setChartType] = useState("bar");
  const [xAxis, setXAxis] = useState("");
  const [yAxis, setYAxis] = useState("");
  const [color, setColor] = useState("#36A2EB");
  const [title, setTitle] = useState("");
  const [showLegend, setShowLegend] = useState(true);

  if (!fileData || fileData.length === 0) {
    return <p>No file data available to create chart.</p>;
  }

  const columns = Object.keys(fileData[0]);

  // ✅ Chart.js Data Format for 2D
  const chartData = {
    labels: fileData.map((row) => row[xAxis]),
    datasets: [
      {
        label: yAxis,
        data: fileData.map((row) => row[yAxis]),
        backgroundColor: color,
        borderColor: color,
      },
    ],
  };

  // ✅ Render Chart
  const renderChart = () => {
    if (!xAxis || !yAxis) return null;

    if (chartType === "bar") return <Bar data={chartData} />;
    if (chartType === "line") return <Line data={chartData} />;
    if (chartType === "pie") return <Pie data={chartData} />;

    if (chartType === "bar3d")
      return <BarChart3D data={fileData} xKey={xAxis} yKey={yAxis} />;
    if (chartType === "pie3d")
      return <PieChart3D data={fileData} xKey={xAxis} yKey={yAxis} />;

    return null;
  };

  // ✅ Save Chart
  const saveChart = async () => {
    if (!xAxis || !yAxis) {
      alert("Please select both X and Y axes");
      return;
    }

    let imageBase64 = null;

    // For 2D charts, capture canvas
    if (["bar", "line", "pie"].includes(chartType)) {
      const canvas = document.querySelector("canvas");
      imageBase64 = canvas.toDataURL("image/png");
    }

    try {
      const res = await fetch("http://localhost:5000/api/charts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fileId,
          chartType,
          xAxis,
          yAxis,
          color,
          title,
          showLegend,
          image: imageBase64, // null for 3D
          data: fileData, // store raw data for 3D rendering
        }),
      });

      if (!res.ok) throw new Error("Failed to save chart");

      alert("Chart saved successfully!");
      navigate(`/charts/${fileId}`);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="p-6 bg-white shadow rounded-lg">
      <h2 className="text-xl font-bold mb-4">Create Chart</h2>

      {/* Chart Type */}
      <label className="block mb-2">Chart Type:</label>
      <select
        value={chartType}
        onChange={(e) => setChartType(e.target.value)}
        className="border p-2 mb-4 w-full"
      >
        <option value="bar">2D Bar</option>
        <option value="line">2D Line</option>
        <option value="pie">2D Pie</option>
        <option value="bar3d">3D Bar</option>
        <option value="pie3d">3D Pie</option>
      </select>

      {/* X Axis */}
      <label className="block mb-2">X Axis:</label>
      <select
        value={xAxis}
        onChange={(e) => setXAxis(e.target.value)}
        className="border p-2 mb-4 w-full"
      >
        <option value="">Select column</option>
        {columns.map((col) => (
          <option key={col} value={col}>
            {col}
          </option>
        ))}
      </select>

      {/* Y Axis */}
      <label className="block mb-2">Y Axis:</label>
      <select
        value={yAxis}
        onChange={(e) => setYAxis(e.target.value)}
        className="border p-2 mb-4 w-full"
      >
        <option value="">Select column</option>
        {columns.map((col) => (
          <option key={col} value={col}>
            {col}
          </option>
        ))}
      </select>

      {/* Color Picker (only for 2D charts) */}
      {["bar", "line", "pie"].includes(chartType) && (
        <>
          <label className="block mb-2">Color:</label>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="mb-4"
          />
        </>
      )}

      {/* Title */}
      <label className="block mb-2">Chart Title:</label>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="border p-2 mb-4 w-full"
      />

      {/* Legend */}
      <label className="flex items-center mb-4">
        <input
          type="checkbox"
          checked={showLegend}
          onChange={(e) => setShowLegend(e.target.checked)}
          className="mr-2"
        />
        Show Legend
      </label>

      {/* Rendered Chart */}
      <div className="mb-4">{renderChart()}</div>

      {/* Save Button */}
      <button
        onClick={saveChart}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Save Chart
      </button>
    </div>
  );
}

export default ChartSelector;
