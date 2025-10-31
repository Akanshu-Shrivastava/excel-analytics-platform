  import jwt from "jsonwebtoken";
  import User from "../models/User.js";
  import Admin from "../models/Admin.js";

  // 🔐 Middleware to check if user is logged in
  export const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      try {
        
        token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // ✅ Check both User and Admin collections
        let account = await User.findById(decoded.id).select("-password");
        if (!account) {
          account = await Admin.findById(decoded.id).select("-password");
        }

        if (!account) {
          return res.status(401).json({ message: "User not found" });
        }

        req.user = account;
        next();
      } catch (error) {
        return res.status(401).json({ message: "Not authorized, token failed" });
      }
    }

    if (!token) return res.status(401).json({ message: "No token, authorization denied" });
  };

  // 🎭 Middleware for role checking
  export const roleCheck = (allowedRoles) => {
    return (req, res, next) => {
      const userRole = req.user?.role;

      if (!userRole) {
        return res.status(403).json({ message: "Forbidden: No role assigned" });
      }

      if (Array.isArray(allowedRoles)) {
        if (!allowedRoles.includes(userRole)) {
          return res.status(403).json({ message: "Forbidden: Insufficient role" });
        }
      } else {
        if (userRole !== allowedRoles) {
          return res.status(403).json({ message: "Forbidden: Insufficient role" });
        }
      }

      next();
    };
  };

  export const authorize = (...roles) => {
    return (req, res, next) => {
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ message: "Not authorized" });
      }
      next();
    };
  };
