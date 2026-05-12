const jwt = require("jsonwebtoken");

// ✅ AUTH MIDDLEWARE
module.exports = function (req, res, next) {
  // Get Authorization header
  const authHeader = req.header("Authorization");

  // ❌ No token provided
  if (!authHeader) {
    return res.status(401).json({
      message: "No token, access denied",
    });
  }

  // ✅ Extract token safely
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : authHeader;
  
  try {
    // ✅ Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Only allow admins
    if (decoded.role !== "admin") {
      return res.status(403).json({
        message: "Admin access only",
      });
    }

    // Save user data to request
    req.user = decoded;

    next();
  } catch (err) {
    // ❌ Invalid or expired token
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};
