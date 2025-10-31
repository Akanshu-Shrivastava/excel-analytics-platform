const jwt = require("jsonwebtoken");
require("dotenv").config();

const token = jwt.sign(
  { id: "688a1a853c0fff33b04f9f54", role: "admin" },
  process.env.JWT_SECRET,
  { expiresIn: "24h" }
);

console.log("Your JWT Token:", token);
