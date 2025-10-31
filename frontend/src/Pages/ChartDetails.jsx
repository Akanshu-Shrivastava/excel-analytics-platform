import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import BackButton from "./BackButton";

const ChartDetails = () => {
  const { id } = useParams();
  const [chart, setChart] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchChart = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/charts/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch chart details");
        const data = await res.json();
        setChart(data);
      } catch (error) {
        console.error("Error fetching chart details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChart();
  }, [id, token]);

  if (loading) return <p>Loading chart details...</p>;
  if (!chart) return <p>Chart not found</p>;

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg">
      <BackButton to={`/charts/${chart.fileId}`} label="⬅ Back to Charts" />

      <h2 className="text-2xl font-bold mb-4">
        {chart.title || "Untitled Chart"}
      </h2>
      <p className="mb-2">
        <strong>Type:</strong> {chart.chartType}
      </p>
      <p className="mb-2">
        <strong>X:</strong> {chart.xAxis} | <strong>Y:</strong> {chart.yAxis}
      </p>
      <p className="mb-4">
        <strong>Created By:</strong> {chart.userId?.name} ({chart.userId?.email})
      </p>
      <img
        src={chart.image}
        alt="Chart"
        className="rounded shadow max-h-96 object-contain"
      />
    </div>
  );
};

export default ChartDetails;
