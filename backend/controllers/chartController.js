import Chart from "../models/Chart.js";

// Save a new chart
export const saveChart = async (req, res) => {
  try {
    const { fileId, chartType, xAxis, yAxis, color, title, showLegend, image } = req.body;

    if (!fileId || !chartType || !xAxis || !yAxis || !image) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newChart = new Chart({
      userId: req.user.id, // from auth middleware
      fileId,
      chartType,
      xAxis,
      yAxis,
      color,
      title,
      showLegend,
      image,
    });

    await newChart.save();

    res.status(201).json({
      message: "Chart saved successfully",
      chart: newChart,
    });
  } catch (error) {
    console.error("Error saving chart:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all charts for a file (for logged-in user)
export const getChartsByFile = async (req, res) => {
  try {
    const { fileId } = req.params;

    const charts = await Chart.find({ fileId, userId: req.user.id }).sort({ createdAt: -1 });

    res.json(charts);
  } catch (error) {
    console.error("Error fetching charts:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get a single chart by ID
export const getChartById = async (req, res) => {
  try {
    const chart = await Chart.findById(req.params.id)
      .populate("userId", "name email")
      .populate("fileId", "originalFileName");

    if (!chart) {
      return res.status(404).json({ message: "Chart not found" });
    }

    // Ensure the chart belongs to the logged-in user
    if (chart.userId._id.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to view this chart" });
    }

    res.json(chart);
  } catch (error) {
    console.error("Error fetching chart:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete a chart
export const deleteChart = async (req, res) => {
  try {
    const { id } = req.params;

    const chart = await Chart.findOneAndDelete({ _id: id, userId: req.user.id });

    if (!chart) {
      return res.status(404).json({ message: "Chart not found" });
    }

    res.json({ message: "Chart deleted successfully" });
  } catch (error) {
    console.error("Error deleting chart:", error);
    res.status(500).json({ message: "Server error" });
  }
};
