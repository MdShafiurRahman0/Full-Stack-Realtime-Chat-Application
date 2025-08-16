// Import the Express.js framework - this is the main web application framework
// Express makes it easy to create web servers and handle HTTP requests
const express = require("express");

// Import the built-in Node.js path module for working with file and directory paths
// This helps us construct proper file paths regardless of operating system
const path = require("path");

// Import the built-in Node.js http module to create an HTTP server
// This allows our Express app to handle HTTP requests and responses
const http = require("http");

// Import the Socket.IO library for real-time, bidirectional communication
// This enables live chat functionality between users
const { Server } = require("socket.io");

// Import the dotenv library to load environment variables from .env file
// Environment variables store configuration like port numbers and database settings
const dotenv = require("dotenv");

// Import the cookie-parser middleware to parse cookies from HTTP requests
// Cookies are used to store user authentication tokens and session data
const cookieParser = require("cookie-parser");

// Load environment variables from the .env file in the root directory
// This makes variables like JWT_SECRET and DATABASE_URL available in process.env
dotenv.config({ path: "./.env" });

// Create an Express application instance
// This is the main application object that handles all web requests
const app = express();

// Create an HTTP server using the Express app
// This server will listen for incoming HTTP connections
const server = http.createServer(app);

// Create a Socket.IO server attached to the HTTP server
// This enables real-time WebSocket connections for the chat functionality
const io = new Server(server);

// Define the path to the public directory where static files are stored
// Static files include CSS, JavaScript, images, and other assets
const publicDirectory = path.join(__dirname, "./public");

// Serve static files from the public directory
// This makes files like style.css and chat.js accessible to web browsers
app.use(express.static(publicDirectory));

// Parse URL-encoded data from form submissions
// This middleware converts form data into JavaScript objects
app.use(express.urlencoded({ extended: false }));

// Parse JSON data from API requests
// This middleware converts JSON strings into JavaScript objects
app.use(express.json());

// Parse cookies from HTTP requests
// This middleware makes cookies available in req.cookies
app.use(cookieParser());

// Debug middleware to log all incoming requests
// This helps developers see what requests are being made to the server
app.use((req, res, next) => {
  // Log the HTTP method (GET, POST, etc.) and the requested path
  console.log(`${req.method} ${req.path}`);
  // Call next() to continue to the next middleware or route handler
  next();
});

// Set the view engine to Handlebars (HBS)
// Handlebars is a template engine that allows us to create dynamic HTML pages
app.set("view engine", "hbs");

// Define and use the main page routes (home, login, register, chat)
// These routes handle the main pages of the application
app.use("/", require("./routes/pages"));

// Define and use the authentication routes (login, register, logout)
// These routes handle user authentication and account management
app.use("/auth", require("./routes/auth"));

// Socket.IO connection logic for real-time chat functionality
// This code runs whenever a new user connects to the chat
io.on("connection", (socket) => {
  // Log when a new user connects to the chat
  console.log("a user connected");

  // Handle when a user disconnects from the chat
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });

  // Handle incoming chat messages from users
  socket.on("chatMessage", (msg) => {
    // Create a timestamp for the message in HH:MM format
    const time = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    // Broadcast the message to all connected users with the timestamp
    // This makes the message appear in real-time for everyone
    io.emit("chatMessage", { ...msg, time: time });
  });

  // Handle typing indicators - shows when someone is typing
  socket.on("typing", (data) => {
    // Broadcast typing indicator to all users except the sender
    // This prevents users from seeing their own typing indicator
    socket.broadcast.emit("typing", data);
  });

  // Handle when someone stops typing
  socket.on("stopTyping", () => {
    // Broadcast stop typing to all users except the sender
    // This hides the typing indicator for everyone
    socket.broadcast.emit("stopTyping");
  });
});

// Start the HTTP server and begin listening for connections
// The server will listen on port 5000 (or the port specified in environment variables)
server.listen(5000, () => {
  // Log a success message when the server starts successfully
  console.log("Server running on port 5000");
});
