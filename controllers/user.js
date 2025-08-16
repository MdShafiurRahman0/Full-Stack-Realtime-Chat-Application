// Import the database connection from the config folder
// This allows us to run SQL queries to check user authentication status
const db = require("../config/db");

// Import the jsonwebtoken library for verifying authentication tokens
// JWT tokens are used to keep users logged in between requests
const jwt = require("jsonwebtoken");

// Import the promisify utility from Node.js built-in util module
// This converts callback-based functions to promise-based functions
const { promisify } = require("util");

// Middleware function to check if a user is currently logged in
// This function runs before protected routes to ensure user authentication
exports.isLoggedIn = async (req, res, next) => {
  // Check if the user has a JWT token stored in their cookies
  // If no token exists, the user is not logged in
  if (req.cookies.jwt) {
    try {
      // Verify the JWT token to ensure it's valid and not expired
      // promisify converts jwt.verify from callback to promise format
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt, // The token from the cookie
        process.env.JWT_SECRET // The secret key to verify the token
      );

      // Check if the user still exists in the database
      // This prevents access if the user account was deleted
      db.query(
        "SELECT * FROM users WHERE id = ?",
        [decoded.id],
        (error, result) => {
          // If no user found with this ID, continue without authentication
          if (!result) {
            return next();
          }
          // If user exists, attach user data to the request object
          // This makes user information available in route handlers
          req.user = result[0];
          // Continue to the next middleware or route handler
          return next();
        }
      );
    } catch (err) {
      // If token verification fails (expired, invalid, etc.), continue without auth
      // This allows the route to handle unauthenticated users appropriately
      return next();
    }
  } else {
    // If no JWT token exists, continue without authentication
    // The route will handle unauthenticated users as needed
    next();
  }
};

// Function to handle user logout (ending user sessions)
// This function is called when users click the logout button
exports.logout = (req, res) => {
  try {
    // Clear the JWT cookie by setting it to 'loggedout' and short expiration
    // Setting expires to 2 seconds from now ensures the cookie is removed quickly
    res.cookie("jwt", "loggedout", {
      expires: new Date(Date.now() + 2 * 1000), // Expires in 2 seconds
      httpOnly: true, // Prevents JavaScript access (security)
      secure: false, // Set to true if using HTTPS
      sameSite: "strict", // Prevents CSRF attacks
    });

    // Also clear any other user-related cookies if they exist
    // This ensures complete cleanup of user session data
    res.clearCookie("user");

    // Log successful logout for debugging purposes
    console.log("User logged out successfully");

    // Redirect the user to the home page after logout
    // Users will see the public home page without authentication
    res.redirect("/");
  } catch (error) {
    // If logout fails, log the error and send error response
    console.error("Logout error:", error);
    res.status(500).send("Logout failed");
  }
};
