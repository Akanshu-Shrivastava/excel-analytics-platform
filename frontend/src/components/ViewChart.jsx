import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function ViewChart() {
  const { chartId } = useParams();
  const navigate = useNavigate();
  const [chart, setChart] = useState(null);

  useEffect(() => {
    const fetchChart = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`/api/charts/${chartId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setChart(res.data);
      } catch (error) {
        console.error("Error fetching chart:", error);
      }
    };
    fetchChart();
  }, [chartId]);

  if (!chart) {
    return <p className="text-center mt-6">Loading chart...</p>;
  }

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
      >
        ← Back to Dashboard
      </button>
      <h2 className="text-3xl font-bold mb-2">{chart.title || "Untitled Chart"}</h2>
      <p className="text-gray-600 mb-4">
        {chart.chartType} | {chart.xAxis} vs {chart.yAxis}
      </p>
      <img
        src={chart.image}
        alt={chart.title}
        className="w-full h-auto border rounded"
      />
    </div>
  );
}
