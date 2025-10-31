const roleCheck = (...allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.user?.role;

    if (!userRole) return res.status(401).json({ message: "Unauthorized: No role found" });

    const normalizedUserRole = userRole.toLowerCase();
    const normalizedAllowed = allowedRoles.map((r) => r.toLowerCase());

    if (!normalizedAllowed.includes(normalizedUserRole)) {
      return res.status(403).json({ message: "Forbidden: Insufficient role" });
    }

    next();
  };
};

export default roleCheck;
