# Project Demonstration

This document provides a demonstration of the key parts of the project, with a focus on the backend code.

## Database Schema

The database schema is implicitly defined by the application's code. The primary table is the `users` table.

### Preview

The following code snippet shows the database connection setup using the `mysql` package. It reads the database credentials from environment variables.

```javascript
// server/config/db.js
const mysql = require("mysql");
const dotenv = require("dotenv");

dotenv.config({ path: "./.env" });

const db = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE,
});

db.connect((error) => {
  if (error) {
    console.error("MySQL connection error:", error);
  } else {
    console.log("MySQL connected successfully");
  }
});

module.exports = db;
```

### `users` Table Schema

Based on the registration code, the `users` table has the following columns:

*   `id`: Primary Key, Auto-increment
*   `name`: VARCHAR
*   `email`: VARCHAR, Unique
*   `password`: VARCHAR (stores hashed password)

## Authentication and Authorization

Authentication is handled using JSON Web Tokens (JWT). Passwords are hashed using `bcryptjs`.

### Preview

The following code snippets showcase the user registration and login functionality.

#### User Registration

This function handles new user registration. It checks if the email is already in use, hashes the password, and inserts the new user into the database.

```javascript
// server/controllers/auth.js
exports.register = async (req, res) => {
  const { name, email, password, passwordConfirm } = req.body;

  console.log("Received registration request:", req.body);

  if (!name || !email || !password || !passwordConfirm) {
    return res.render("register", { message: "Please fill in all fields" });
  }

  if (password !== passwordConfirm) {
    return res.render("register", { message: "Passwords do not match" });
  }

  db.query(
    "SELECT email FROM users WHERE email = ?",
    [email],
    async (error, results) => {
      if (error) {
        console.error("DB error:", error);
        return res.render("register", { message: "Database error" });
      }

      if (results.length > 0) {
        return res.render("register", {
          message: "That email is already in use",
        });
      }

      try {
        const hashedPassword = await bcrypt.hash(password, 8);

        db.query(
          "INSERT INTO users SET ?",
          { name, email, password: hashedPassword },
          (error, results) => {
            if (error) {
              console.error("Insert error:", error);
              return res.render("register", {
                message: "User registration failed",
              });
            }

            console.log("Insert result:", results);
            return res.render("register", {
              message: "User registered successfully",
            });
          }
        );
      } catch (err) {
        console.error("Hashing error:", err);
        return res.render("register", { message: "Something went wrong" });
      }
    }
  );
};
```

#### User Login

This function handles user login. It verifies the user's credentials, and if successful, creates a JWT and sends it to the user as a cookie.

```javascript
// server/controllers/auth.js
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.render("login", {
      message: "Please provide email and password",
    });
  } else {
    db.query(
      "SELECT * FROM users WHERE email = ?",
      [email],
      async (error, results) => {
        if (error) {
          console.log(error);
        }

        if (
          results.length === 0 ||
          !(await bcrypt.compare(password, results[0].password))
        ) {
          res.status(401).render("login", {
            message: "Incorrect email or password",
          });
        } else {
          const id = results[0].id;

          const token = jwt.sign({ id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN,
          });

          console.log("The token is: " + token);

          const cookieOptions = {
            expires: new Date(
              Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
            ),
            httpOnly: true,
          };

          res.cookie("jwt", token, cookieOptions);
          res.status(200).redirect("/");
        }
      }
    );
  }
};
```

#### Authorization Middleware

This middleware function checks if a user is logged in by verifying the JWT cookie. It protects routes that require authentication.

```javascript
// server/controllers/user.js
exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      db.query(
        "SELECT * FROM users WHERE id = ?",
        [decoded.id],
        (error, result) => {
          if (!result) {
            return next();
          }
          req.user = result[0];
          return next();
        }
      );
    } catch (err) {
      return next();
    }
  } else {
    next();
  }
};
```

#### Authentication Routes

These are the API routes for authentication.

```javascript
// server/routes/auth.js
const express = require("express");
const authController = require("../controllers/auth");
const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/logout", authController.logout);

module.exports = router;
```

## Important Features

### Real-time Chat

The application includes a real-time chat feature using Socket.io.

#### Preview

The following code snippet shows the server-side implementation of the chat. It listens for new connections, disconnections, and chat messages.

```javascript
// server/app.js
io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });

  socket.on("chatMessage", (msg) => {
    const time = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    io.emit("chatMessage", { ...msg, time: time });
  });

  socket.on("typing", (data) => {
    socket.broadcast.emit("typing", data);
  });

  socket.on("stopTyping", () => {
    socket.broadcast.emit("stopTyping");
  });
});
```

### Page Routing

Page routing is handled by Express.js.

#### Preview

The following code defines the routes for the main pages of the application. The `isLoggedIn` middleware is used to protect the chat page.

```javascript
// server/routes/pages.js
const express = require("express");
const userController = require("../controllers/user");
const router = express.Router();

router.get("/", userController.isLoggedIn, (req, res) => {
  res.render("index", { user: req.user });
});

router.get("/register", (req, res) => {
  res.render("register");
});

router.get("/login", (req, res) => {
  res.render("login");
});

router.get("/chat", userController.isLoggedIn, (req, res) => {
  res.render("chat", { user: req.user });
});

module.exports = router;
```
