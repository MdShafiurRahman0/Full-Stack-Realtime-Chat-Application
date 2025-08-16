// Import the bcrypt library for hashing passwords securely
// bcrypt is a password hashing function that makes passwords safe to store
const bcrypt = require("bcryptjs");

// Import the database connection from the config folder
// This allows us to run SQL queries to store and retrieve user data
const db = require("../config/db");

// Import the jsonwebtoken library for creating authentication tokens
// JWT tokens are used to keep users logged in between requests
const jwt = require("jsonwebtoken");

// Function to handle user registration (creating new accounts)
// This function is called when users submit the registration form
exports.register = async (req, res) => {
  // Extract user data from the request body (form submission)
  // Destructuring gets individual values from the form data
  const { name, email, password, passwordConfirm } = req.body;

  // Log the registration request for debugging purposes
  // This helps developers see what data is being submitted
  console.log("Received registration request:", req.body);

  // Check if all required fields are filled in
  // If any field is missing, show an error message
  if (!name || !email || !password || !passwordConfirm) {
    // Render the registration page again with an error message
    // The user will see what went wrong and can try again
    return res.render("register", { message: "Please fill in all fields" });
  }

  // Check if the password and password confirmation match
  // This prevents typos when users create their passwords
  if (password !== passwordConfirm) {
    // Render the registration page with a password mismatch error
    return res.render("register", { message: "Passwords do not match" });
  }

  // Check if the email is already registered in the database
  // This prevents duplicate accounts with the same email
  db.query(
    "SELECT email FROM users WHERE email = ?",
    [email],
    async (error, results) => {
      // If there's a database error, log it and show an error message
      if (error) {
        console.error("DB error:", error);
        return res.render("register", { message: "Database error" });
      }

      // If the email already exists, show an error message
      if (results.length > 0) {
        return res.render("register", {
          message: "That email is already in use",
        });
      }

      // If email is available, proceed with account creation
      try {
        // Hash the password using bcrypt with 8 salt rounds
        // Salt rounds make the password harder to crack
        const hashedPassword = await bcrypt.hash(password, 8);

        // Insert the new user into the database
        // Store the hashed password, not the plain text password
        db.query(
          "INSERT INTO users SET ?",
          { name, email, password: hashedPassword },
          (error, results) => {
            // If there's an error inserting the user, log it and show error
            if (error) {
              console.error("Insert error:", error);
              return res.render("register", {
                message: "User registration failed",
              });
            }

            // Log the successful insertion for debugging
            console.log("Insert result:", results);
            // Show success message to the user
            return res.render("register", {
              message: "User registered successfully",
            });
          }
        );
      } catch (err) {
        // If password hashing fails, log the error and show error message
        console.error("Hashing error:", err);
        return res.render("register", { message: "Something went wrong" });
      }
    }
  );
};

// Function to handle user login (signing in existing users)
// This function is called when users submit the login form
exports.login = async (req, res) => {
  // Extract login credentials from the request body
  const { email, password } = req.body;

  // Check if both email and password are provided
  if (!email || !password) {
    // If fields are missing, show an error message
    res.render("login", {
      message: "Please provide email and password",
    });
  } else {
    // Query the database to find the user with the provided email
    db.query(
      "SELECT * FROM users WHERE email = ?",
      [email],
      async (error, results) => {
        // If there's a database error, log it
        if (error) {
          console.log(error);
        }

        // Check if user exists and password is correct
        // bcrypt.compare checks the provided password against the stored hash
        if (
          results.length === 0 ||
          !(await bcrypt.compare(password, results[0].password))
        ) {
          // If login fails, show an error message
          res.status(401).render("login", {
            message: "Incorrect email or password",
          });
        } else {
          // If login is successful, get the user's ID
          const id = results[0].id;

          // Create a JWT token for the user
          // This token will be used to keep the user logged in
          const token = jwt.sign({ id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN,
          });

          // Log the token for debugging (remove in production)
          console.log("The token is: " + token);

          // Set cookie options for the JWT token
          const cookieOptions = {
            // Token expires after the specified number of days
            expires: new Date(
              Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
            ),
            // httpOnly prevents JavaScript from accessing the cookie (security)
            httpOnly: true,
          };

          // Set the JWT token as a cookie in the user's browser
          res.cookie("jwt", token, cookieOptions);
          // Redirect the user to the home page after successful login
          res.status(200).redirect("/");
        }
      }
    );
  }
};
