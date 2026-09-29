
const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    // Get the token from the request header
    const authHeader = req.headers.authorization;

    // Check if the token exists and uses Bearer format
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access denied. Please log in.",
      });
    }

    // Extract the actual JWT
    const token = authHeader.split(" ")[1];

    // Verify the token using our secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the user's information to the request
    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    // Continue to the next middleware or controller
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token. Please log in again.",
    });
  }
};

module.exports = authMiddleware;