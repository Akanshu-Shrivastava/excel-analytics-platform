import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 p-6">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white shadow-2xl rounded-2xl p-10 max-w-md text-center"
      >
        <motion.h1
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.4 }}
          className="text-6xl font-extrabold text-blue-600 mb-4"
        >
          404
        </motion.h1>

        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Page Not Found
        </h2>

        <p className="text-gray-500 mb-6">
          Oops! The page you’re looking for doesn’t exist or has been moved.
        </p>

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link
            to="/"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-xl shadow hover:bg-blue-700 transition"
          >
            ⬅ Back to Home
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default NotFound;
