import React, { useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../redux/slices/authSlice";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });
  
      // eslint-disable-next-line no-unused-vars
      const { user, token, status } = res.data;
  
      // ✅ Dispatch to Redux (this also updates localStorage via slice)
      dispatch(loginSuccess({ user, token }));
  
      toast.success("Login successful");
  
      // ✅ Handle pending admin immediately
      if (user.role === "admin" && !user.isApproved) {
        navigate("/pending-approval");
      } else if (user.role === "admin") {
        navigate("/admin/dashboard");
      } else if (user.role === "super-admin") {
        navigate("/superadmin/dashboard");
      } else if (user.role === "user") {
        navigate("/user/dashboard");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="absolute top-6 left-6 flex items-center">
        <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center mr-3 shadow-md">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-indigo-800">Excel Analytics</h1>
      </div>
      
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md relative overflow-hidden transition-all duration-300 hover:shadow-2xl"
      >
        {/* Decorative elements */}
        <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full bg-indigo-100 opacity-50"></div>
        <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full bg-purple-100 opacity-50"></div>
        
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-2 text-center text-gray-800">Welcome Back</h2>
          <p className="text-center text-gray-600 mb-8">Sign in to your Excel Analytics account</p>
          
          <div className="mb-5">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 outline-none"
              required
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 outline-none"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-all duration-300 flex items-center justify-center ${
              isLoading ? "bg-indigo-400" : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              "Login"
            )}
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">New to Excel Analytics?</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate("/signup")}
            className="w-full py-3 px-4 rounded-lg border border-indigo-600 text-indigo-600 font-medium hover:bg-indigo-50 transition-all duration-300"
          >
            Create an Account
          </button>
        </div>
      </form>
    </div>
  );
};

export default Login;