import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import BackButton from "./BackButton";

const ChartDashboard = () => {
  const { fileId } = useParams();
  const [charts, setCharts] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchCharts = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `http://localhost:5000/api/charts/file/${fileId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch charts");
        const data = await res.json();
        setCharts(data);
      } catch (error) {
        console.error("Error fetching charts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCharts();
  }, [fileId, token, location.state]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this chart?")) return;

    try {
      const res = await fetch(`http://localhost:5000/api/charts/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to delete chart");
      setCharts((prev) => prev.filter((chart) => chart._id !== id));
    } catch (error) {
      console.error("Error deleting chart:", error);
    }
  };

  if (loading) return <p>Loading charts...</p>;

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg">
      <BackButton to="/" label="⬅ Back to Upload History" />

      <h2 className="text-2xl font-bold mb-6">Charts Dashboard</h2>

      {charts.length === 0 ? (
        <p>No charts available for this file.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {charts.map((chart) => (
            <div
              key={chart._id}
              className="p-4 border rounded shadow hover:shadow-lg transition"
            >
              <h3 className="text-lg font-semibold mb-2">
                {chart.title || "Untitled Chart"}
              </h3>
              <p className="text-sm mb-1">
                <strong>Type:</strong> {chart.chartType}
              </p>
              <p className="text-sm mb-1">
                <strong>X:</strong> {chart.xAxis} | <strong>Y:</strong>{" "}
                {chart.yAxis}
              </p>
              <img
                src={chart.image}
                alt="Chart"
                className="mb-3 rounded shadow max-h-60 object-contain"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => navigate(`/chart-details/${chart._id}`)}
                  className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                >
                  View Details
                </button>
                <button
                  onClick={() => handleDelete(chart._id)}
                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChartDashboard;
