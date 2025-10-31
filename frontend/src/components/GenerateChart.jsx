import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const GenerateChart = () => {
  const { fileId } = useParams();
  const [form, setForm] = useState({
    chartType: "bar",
    xAxis: "",
    yAxis: "",
    color: "#000000",
    title: "",
    showLegend: true,
  });
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/charts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...form, fileId }),
      });

      if (!res.ok) throw new Error("Failed to generate chart");

      alert("Chart generated successfully!");
      navigate(`/dashboard/${fileId}`); // go to chart dashboard
    } catch (error) {
      console.error("Error generating chart:", error);
    }
  };

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg max-w-lg mx-auto">
      {/* 🔙 Back Button */}
      <button
        onClick={() => navigate("/")}
        className="mb-4 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
      >
        ⬅ Back to Upload History
      </button>

      <h2 className="text-2xl font-bold mb-4">Generate Chart</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          placeholder="Chart Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="border p-2 block w-full"
        />
        <input
          placeholder="X Axis"
          value={form.xAxis}
          onChange={(e) => setForm({ ...form, xAxis: e.target.value })}
          className="border p-2 block w-full"
        />
        <input
          placeholder="Y Axis"
          value={form.yAxis}
          onChange={(e) => setForm({ ...form, yAxis: e.target.value })}
          className="border p-2 block w-full"
        />
        <select
          value={form.chartType}
          onChange={(e) => setForm({ ...form, chartType: e.target.value })}
          className="border p-2 block w-full"
        >
          <option value="bar">Bar</option>
          <option value="line">Line</option>
          <option value="pie">Pie</option>
        </select>
        <input
          type="color"
          value={form.color}
          onChange={(e) => setForm({ ...form, color: e.target.value })}
          className="border p-2 block w-full"
        />
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.showLegend}
            onChange={(e) => setForm({ ...form, showLegend: e.target.checked })}
          />
          Show Legend
        </label>
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full"
        >
          Generate Chart
        </button>
      </form>
    </div>
  );
};

export default GenerateChart;
