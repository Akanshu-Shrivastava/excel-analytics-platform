// middleware/roleCheck.js
const roleCheck = (allowedRoles) => {
    return (req, res, next) => {
      const userRole = req.user.role;
  
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
  
  export default roleCheck;
  