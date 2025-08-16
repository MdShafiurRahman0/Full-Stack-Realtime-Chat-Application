// Import the MySQL library to connect to MySQL database
// This library provides functions to interact with MySQL databases
const mysql = require("mysql");

// Import the dotenv library to load environment variables from .env file
// Environment variables store sensitive information like database credentials
const dotenv = require("dotenv");

// Load environment variables from the .env file in the root directory
// This makes variables like DATABASE_HOST, DATABASE_USER available in process.env
dotenv.config({ path: "./.env" });

// Create a connection object to MySQL database
// This object contains all the connection details needed to connect to the database
const db = mysql.createConnection({
  // The hostname or IP address where MySQL server is running
  // Usually 'localhost' for local development or server IP for production
  host: process.env.DATABASE_HOST,

  // The username to authenticate with MySQL server
  // This user must have permissions to access the specified database
  user: process.env.DATABASE_USER,

  // The password for the MySQL user account
  // This should be stored securely in the .env file, never in the code
  password: process.env.DATABASE_PASSWORD,

  // The name of the specific database to connect to
  // This database must exist on the MySQL server
  database: process.env.DATABASE,
});

// Attempt to establish a connection to the MySQL database
// This function runs when the application starts
db.connect((error) => {
  // Check if there was an error during connection
  if (error) {
    // If connection failed, log the error details to console
    // This helps developers debug connection issues
    console.error("MySQL connection error:", error);
  } else {
    // If connection successful, log a success message
    // This confirms the database is ready to use
    console.log("MySQL connected successfully");
  }
});

// Export the database connection object so other files can use it
// This allows other parts of the application to make database queries
module.exports = db;
