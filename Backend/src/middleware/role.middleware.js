const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.user?.role?.toLowerCase();
    const normalizedAllowedRoles = allowedRoles.map((role) => role.toLowerCase());

    if (!userRole || !normalizedAllowedRoles.includes(userRole)) {
      return res.status(403).json({ success: false, message: 'Forbidden: Insufficient permissions' });
    }
    next();
  };
};

module.exports = roleMiddleware;