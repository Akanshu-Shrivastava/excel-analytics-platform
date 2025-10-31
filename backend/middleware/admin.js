// Checks if the logged-in user is a super-admin
const isSuperAdmin = (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
  
    if (req.user.role !== "super-admin") {
      return res.status(403).json({ message: "Forbidden: Super-admin only" });
    }
  
    next();
  };
  
  export default isSuperAdmin;
  