import { configureStore } from "@reduxjs/toolkit";
import uploadHistoryReducer from "./uploadHistorySlice";
import parsedFileReducer from "./parsedFileSlice";
import authReducer from "./slices/authSlice";

export const store = configureStore({
  reducer: {
    uploadHistory: uploadHistoryReducer,
    parsedFile: parsedFileReducer,
    auth: authReducer,
  },
  devTools: import.meta.env.MODE !== "production", // Vite-friendly
});

export default store;
