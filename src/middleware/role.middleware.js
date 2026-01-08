// module.exports = (...roles) => {
//   return (req, res, next) => {
//     if (!roles.includes(req.user.role))
//       return res.status(403).json({ message: "Access denied" });
//     next();
//   };
// };


// module.exports = (...roles) => {
//   return (req, res, next) => {
//     if (!req.user || !req.user.role) {
//       return res.status(403).json({ message: "Role not found" });
//     }

//     const userRole = req.user.role.toLowerCase();
//     const allowedRoles = roles.map(r => r.toLowerCase());

//     if (!allowedRoles.includes(userRole)) {
//       return res.status(403).json({ message: "Access denied" });
//     }

//     next();
//   };
// };




module.exports = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
};

