import React from "react";
import { useNavigate } from "react-router-dom";

const BackButton = ({ to = "/", label = "⬅ Back" }) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(to)}
      className="mb-4 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
    >
      {label}
    </button>
  );
};

export default BackButton;
