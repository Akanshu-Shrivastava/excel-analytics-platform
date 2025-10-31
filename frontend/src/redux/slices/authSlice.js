import { createSlice } from "@reduxjs/toolkit";

// ✅ Initial state reads from localStorage (so refresh won’t log you out)
const token = localStorage.getItem("token");
const role = localStorage.getItem("role");
const name = localStorage.getItem("name");

const isApproved = localStorage.getItem("isApproved") === "true";

const initialState = {
  isAuthenticated: !!token,
  token: token || null,
  user: {
    name: name || "",
    role: role || "user",
    isApproved,
  },
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // ✅ Triggered when login/signup succeeds
    loginSuccess: (state, action) => {
      const { user, token } = action.payload;
      state.isAuthenticated = true;
      state.token = token;
      state.user = user;
    
      // ✅ persist to localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("role", user.role);
      localStorage.setItem("name", user.name);
      localStorage.setItem("isApproved", user.isApproved); // optional, for admin check
    },
    

    // ✅ Clear everything on logout
    logout: (state) => {
      state.isAuthenticated = false;
      state.token = null;
      state.user = { name: "", role: "user" };
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("name");
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
