// Import the Express.js router to create modular route handlers
// This allows us to organize our routes in separate files for better code organization
const express = require("express");

// Import the user controller which contains the business logic for user operations
// Controllers handle the actual work like checking if users are logged in
const userController = require("../controllers/user");

// Create a new router instance for handling page-related routes
// This router will handle routes like home page, login page, register page, etc.
const router = express.Router();

// Route for the home page (root URL: /)
// This route checks if the user is logged in before showing the page
router.get("/", userController.isLoggedIn, (req, res) => {
  // Render the 'index' template (home page) and pass the user data
  // If user is logged in, req.user will contain user information
  // If not logged in, req.user will be undefined
  res.render("index", { user: req.user });
});

// Route for the user registration page (URL: /register)
// This page allows new users to create accounts
router.get("/register", (req, res) => {
  // Render the 'register' template (registration form)
  // No authentication required - anyone can access this page
  res.render("register");
});

// Route for the user login page (URL: /login)
// This page allows existing users to sign in
router.get("/login", (req, res) => {
  // Render the 'login' template (login form)
  // No authentication required - anyone can access this page
  res.render("login");
});

// Route for the chat page (URL: /chat)
// This route requires users to be logged in before accessing the chat
router.get("/chat", userController.isLoggedIn, (req, res) => {
  // Render the 'chat' template and pass the user data
  // The isLoggedIn middleware ensures only authenticated users can access this
  res.render("chat", { user: req.user });
});

// Export the router so it can be used in the main app.js file
// This makes all the routes defined above available to the main application
module.exports = router;
