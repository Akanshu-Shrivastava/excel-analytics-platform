import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchParsedFile = createAsyncThunk(
  'parsedFile/fetchParsedFile',
  async (fileId) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`http://localhost:5000/api/upload/parsed/${fileId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    return data;
  }
);

const parsedFileSlice = createSlice({
  name: 'parsedFile',
  initialState: { data: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchParsedFile.pending, (state) => { state.loading = true; })
      .addCase(fetchParsedFile.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data;
      })
      .addCase(fetchParsedFile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  }
});

export default parsedFileSlice.reducer;
