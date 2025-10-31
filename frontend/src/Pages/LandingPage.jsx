// src/Pages/LandingPage.jsx
import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen text-white overflow-hidden font-sans">
      {/* 🌌 Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 animate-gradient-x"></div>

      {/* Page Content */}
      <div className="relative z-10">
        {/* Navbar */}
        <motion.nav
          className="flex justify-between items-center px-8 py-5"
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-yellow-300 via-pink-400 to-indigo-400 bg-clip-text text-transparent">
            ExcelVision
          </h1>
          <div className="flex gap-4">
            <button
              onClick={() => navigate("/login")}
              className="px-5 py-2 bg-white text-indigo-700 font-semibold rounded-lg shadow-lg hover:scale-105 transition duration-300"
            >
              Login
            </button>
            <button
              onClick={() => navigate("/signup")}
              className="px-5 py-2 bg-yellow-400 text-indigo-900 font-semibold rounded-lg shadow-lg hover:scale-105 transition duration-300"
            >
              Sign Up
            </button>
          </div>
        </motion.nav>

        {/* Hero Section */}
        <motion.section
          className="mt-20 px-6 max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8"
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9 }}
        >
          {/* Left Column - Text */}
          <div className="flex-1 text-left">
            <h2 className="text-5xl font-extrabold leading-snug mb-4">
              Analyze Excel Files <br />
              <span className="text-yellow-300">Smarter & Faster</span>
            </h2>
            <p className="text-lg max-w-lg text-gray-200 mb-6">
              Upload, visualize, and generate AI-powered summaries from your
              Excel files — all in one place. Simple. Fast. Secure.
            </p>
            <motion.button
              onClick={() => navigate("/login")}
              className="px-8 py-3 bg-yellow-400 text-indigo-900 font-bold text-lg rounded-xl shadow-xl hover:scale-110 transition"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              Get Started
            </motion.button>
          </div>

          {/* Right Column - Image */}
          <div className="flex-1 flex justify-center md:justify-end">
            <img
              src="/images/pic-removebg-preview.png"
              alt="Excel Analytics Illustration"
              className="w-full max-w-md rounded-xl "
            />
          </div>
        </motion.section>

        {/* Features Section */}
        <section className="mt-32 px-10 grid md:grid-cols-3 gap-10 max-w-6xl mx-auto">
          {[
            {
              title: "📊 Data Visualization",
              desc: "Generate 2D and 3D charts instantly from your Excel files.",
            },
            {
              title: "🔒 Secure & Reliable",
              desc: "Your data is safe with JWT authentication and role-based access.",
            },
            {
              title: "⚡ Fast Processing",
              desc: "Upload and process large Excel files in seconds.",
            },
            {
              title: "📁 Easy Management",
              desc: "Keep track of your uploaded files with intuitive dashboards.",
            },
            {
              title: "🌐 Cloud Ready",
              desc: "Access your data anywhere with seamless cloud integration.",
            },
            {
              title: "📈 Trend Analysis",
              desc: "Identify key trends and patterns from your Excel data.",
            },
          ].map((feature, idx) => (
            <motion.div
              key={idx}
              className="bg-white/10 p-8 rounded-2xl shadow-lg backdrop-blur-lg border border-white/20
                 hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] hover:scale-105 transition-transform duration-500"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.2, duration: 0.8 }}
            >
              <h3 className="text-2xl font-semibold mb-3 text-white drop-shadow-lg">
                {feature.title}
              </h3>
              <p className="text-gray-200">{feature.desc}</p>
            </motion.div>
          ))}
        </section>

        {/* Footer */}
        <motion.footer
          className="mt-32 py-6 text-center text-gray-300 text-sm"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          © {new Date().getFullYear()} ExcelVision | Built with ❤️ by Akanshu
          Shrivastava
        </motion.footer>
      </div>
    </div>
  );
}

export default LandingPage;
