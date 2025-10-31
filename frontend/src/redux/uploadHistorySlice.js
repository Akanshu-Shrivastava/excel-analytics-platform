// src/redux/uploadHistorySlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";

// ✅ Fetch upload history
export const fetchUploadHistory = createAsyncThunk(
  "uploadHistory/fetchUploadHistory",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/files/history", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch upload history"
      );
    }
  }
);

// ✅ Delete file
export const deleteFileThunk = createAsyncThunk(
  "uploadHistory/deleteFile",
  async (fileId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/files/${fileId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("File deleted successfully!");
      return fileId; // return the id for reducer
    } catch (err) {
      toast.error("Failed to delete file");
      return rejectWithValue(
        err.response?.data?.message || "Failed to delete file"
      );
    }
  }
);

const uploadHistorySlice = createSlice({
  name: "uploadHistory",
  initialState: {
    uploadHistory: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // ✅ Fetch history
      .addCase(fetchUploadHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUploadHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.uploadHistory = action.payload;
      })
      .addCase(fetchUploadHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ✅ Delete file
      .addCase(deleteFileThunk.fulfilled, (state, action) => {
        state.uploadHistory = state.uploadHistory.filter(
          (file) => file._id !== action.payload
        );
      })
      .addCase(deleteFileThunk.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export default uploadHistorySlice.reducer;
  