import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { User, Mail, Lock, UserCheck, Plus, Sparkles } from "lucide-react";

export default function CreateUserForm({ role, onSuccess }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });
  const [isLoading, setIsLoading] = useState(false);

  const token = localStorage.getItem("token");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await axios.post(
        "http://localhost:5000/api/admin/create",
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("User created successfully!");
      onSuccess(); // refresh user list
      setFormData({ name: "", email: "", password: "", role: "user" });
    } catch (err) {
      console.error(err);
      toast.error("Failed to create user");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 opacity-50"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent"></div>
      
      {/* Floating decorative elements */}
      <div className="absolute top-4 right-4 w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full opacity-10 animate-pulse"></div>
      <div className="absolute bottom-4 left-4 w-8 h-8 bg-gradient-to-br from-indigo-400 to-pink-500 rounded-full opacity-10 animate-bounce"></div>
      
      <form
        onSubmit={handleSubmit}
        className="relative bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-white/20 space-y-6 transition-all duration-300 hover:shadow-3xl hover:scale-[1.02] group"
      >
        {/* Header with icon */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300">
            <Plus className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Create New User
            </h3>
            <p className="text-gray-500 text-sm">Add a new member to your team</p>
          </div>
          <Sparkles className="w-5 h-5 text-yellow-400 ml-auto animate-pulse" />
        </div>

        {/* Name Input */}
        <div className="relative group/input">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <User className="h-5 w-5 text-gray-400 group-focus-within/input:text-blue-500 transition-colors duration-200" />
          </div>
          <input
            type="text"
            placeholder="Full Name"
            value={formData.name}
            required
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl bg-white/50 backdrop-blur-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 placeholder-gray-400 text-gray-700 hover:border-gray-300 hover:shadow-md"
          />
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-pink-500/0 group-focus-within/input:from-blue-500/5 group-focus-within/input:via-purple-500/5 group-focus-within/input:to-pink-500/5 transition-all duration-300 pointer-events-none"></div>
        </div>

        {/* Email Input */}
        <div className="relative group/input">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-gray-400 group-focus-within/input:text-blue-500 transition-colors duration-200" />
          </div>
          <input
            type="email"
            placeholder="Email Address"
            value={formData.email}
            required
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl bg-white/50 backdrop-blur-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 placeholder-gray-400 text-gray-700 hover:border-gray-300 hover:shadow-md"
          />
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-pink-500/0 group-focus-within/input:from-blue-500/5 group-focus-within/input:via-purple-500/5 group-focus-within/input:to-pink-500/5 transition-all duration-300 pointer-events-none"></div>
        </div>

        {/* Password Input */}
        <div className="relative group/input">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400 group-focus-within/input:text-blue-500 transition-colors duration-200" />
          </div>
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            required
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl bg-white/50 backdrop-blur-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 placeholder-gray-400 text-gray-700 hover:border-gray-300 hover:shadow-md"
          />
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-pink-500/0 group-focus-within/input:from-blue-500/5 group-focus-within/input:via-purple-500/5 group-focus-within/input:to-pink-500/5 transition-all duration-300 pointer-events-none"></div>
        </div>

        {/* Role Selection - Only for super-admin */}
        {role === "super-admin" && (
          <div className="relative group/input">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
              <UserCheck className="h-5 w-5 text-gray-400 group-focus-within/input:text-blue-500 transition-colors duration-200" />
            </div>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl bg-white/50 backdrop-blur-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 text-gray-700 hover:border-gray-300 hover:shadow-md appearance-none cursor-pointer"
            >
              <option value="user">👤 User</option>
              <option value="admin">👑 Admin</option>
            </select>
            {/* Custom dropdown arrow */}
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400 group-focus-within/input:text-blue-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-pink-500/0 group-focus-within/input:from-blue-500/5 group-focus-within/input:via-purple-500/5 group-focus-within/input:to-pink-500/5 transition-all duration-300 pointer-events-none"></div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none group/button"
        >
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-0 group-hover/button:opacity-100 transition-opacity duration-300"></div>
          
          {/* Button content */}
          <div className="relative flex items-center justify-center gap-2">
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Creating User...</span>
              </>
            ) : (
              <>
                <Plus className="w-5 h-5 group-hover/button:rotate-90 transition-transform duration-300" />
                <span>Create User</span>
                <div className="w-5 h-5 bg-white/20 rounded-full group-hover/button:scale-110 transition-transform duration-300"></div>
              </>
            )}
          </div>

          {/* Shimmer effect */}
          <div className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover/button:animate-shimmer"></div>
        </button>

        {/* Success indicator */}
        <div className="text-center">
          <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            Ready to add new team members
          </p>
        </div>
      </form>

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%) skewX(-12deg); }
          100% { transform: translateX(200%) skewX(-12deg); }
        }
        .animate-shimmer {
          animation: shimmer 1.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}