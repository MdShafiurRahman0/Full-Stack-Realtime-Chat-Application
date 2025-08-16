// Import the Express.js router to create modular route handlers for authentication
// This router will handle all authentication-related routes like login, register, logout
const express = require("express");

// Import the auth controller which contains the business logic for authentication
// This controller handles user registration, login, and other auth operations
const authController = require("../controllers/auth");

// Create a new router instance specifically for authentication routes
// This keeps authentication logic separate from other application routes
const router = express.Router();

// Route for user registration (POST request to /auth/register)
// This route handles the form submission when users create new accounts
router.post("/register", authController.register);

// Route for user login (POST request to /auth/login)
// This route handles the form submission when users sign in
router.post("/login", authController.login);

// Route for user logout (GET request to /auth/logout)
// This route handles user logout and session cleanup
router.get("/logout", authController.logout);

// Export the router so it can be used in the main app.js file
// This makes all the authentication routes available to the main application
module.exports = router;
