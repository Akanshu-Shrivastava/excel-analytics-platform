import mongoose from 'mongoose';

const chartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'File', // Ensure 'File' matches your uploads model name
    required: true
  },
  chartType: {
    type: String,
    required: true
  },
  xAxis: {
    type: String,
    required: true
  },
  yAxis: {
    type: String,
    required: true
  },
  color: String,
  title: String,
  showLegend: Boolean,
  image: {
    type: String, // Base64 encoded PNG
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Chart", chartSchema);

