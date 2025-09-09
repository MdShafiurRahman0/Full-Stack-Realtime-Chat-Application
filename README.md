
# 🔐 Node.js & MySQL Authentication System

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)
[![Dependencies](https://img.shields.io/badge/dependencies-up%20to%20date-brightgreen.svg)](https://github.com/MdShafiurRahman0/Full-Stack-Realtime-Chat-Application/pulls)

A robust and secure template for a full-stack web application featuring user authentication powered by Node.js, Express, and MySQL. This project provides a solid foundation for building applications that require user registration, login, and protected content, incorporating real-time features with Socket.IO.

<br/>

![Demo GIF](https://github.com/MdShafiurRahman0/Full-Stack-Realtime-Chat-Application/raw/main/assets/screen-capture.gif)

---

## ✨ Key Features

-   **Secure User Registration:** Passwords are automatically hashed using `bcryptjs` for maximum security.
-   **JWT-Based Authentication:** User sessions are managed using JSON Web Tokens (JWT), the industry standard for stateless, secure authentication.
-   **Persistent Sessions:** Cookies are used to store JWTs, allowing users to stay logged in between visits.
-   **Protected Routes:** Easily protect pages and API endpoints, ensuring only authenticated users can access them.
-   **Real-time Chat:** A simple but effective real-time chat is included, built with Socket.IO.
-   **Organized & Scalable Structure:** The project is organized into a `client` and `server` structure, making it easy to manage and scale.

---

## 🛠️ Technology Stack

| Category      | Technology                                                                                             | Description                                                 |
| :------------ | :----------------------------------------------------------------------------------------------------- | :---------------------------------------------------------- |
| **Backend**   | [Node.js](https://nodejs.org/), [Express.js](https://expressjs.com/)                                    | For building the server-side logic and RESTful APIs.        |
| **Database**  | [MySQL](https://www.mysql.com/)                                                                        | A reliable relational database for storing user data.       |
| **Real-time** | [Socket.IO](https://socket.io/)                                                                        | Enables bidirectional, real-time communication for chat.    |
| **Auth**      | [JSON Web Tokens (JWT)](https://jwt.io/), [bcryptjs](https://www.npmjs.com/package/bcryptjs)             | For secure password hashing and session management.         |
| **Frontend**  | [Handlebars (HBS)](https://handlebarsjs.com/)                                                          | A templating engine to render dynamic HTML pages on the server. |

---

## 📂 Project Structure

The project is organized with a clear separation between server-side and client-side concerns.

```
node-mysql/
├── client/
│   ├── public/     # Contains all static assets (CSS, client-side JavaScript)
│   └── views/      # Handlebars (.hbs) templates that create the UI
├── server/
│   ├── app.js      # The main Express server entry point and configuration
│   ├── config/     # Database connection settings
│   ├── controllers/ # The core business logic for handling requests
│   └── routes/     # Defines the application's API and page routes
├── .env            # Stores all environment variables (must be created manually)
└── package.json    # Lists project dependencies and defines scripts
```

---

## 🚀 Getting Started

Follow these steps to set up and run the project on your local machine.

### 1. Prerequisites

Before you begin, ensure you have the following installed:
-   [**Node.js and npm**](https://nodejs.org/en/download/): Required to run the server and manage packages.
-   [**MySQL Server**](https://dev.mysql.com/downloads/mysql/): The database where user data will be stored.

### 2. Installation and Setup

**Step 1: Clone the Repository**
Open your terminal and clone this repository to your local machine.

```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
```

**Step 2: Install Project Dependencies**
This command reads the `package.json` file and installs all the necessary libraries (like Express, bcrypt, etc.).

```bash
npm install
```

**Step 3: Configure Your Environment**
You need to create a `.env` file to store your database credentials and other secrets.

   a. Create a new file named `.env` in the root directory of the project.
   
   b. Copy the content below and paste it into your new `.env` file. This file contains the environment variables for the database connection and JWT settings.

```dotenv
DATABASE = nodejs-login
DATABASE_HOST = localhost
DATABASE_USER = root
DATABASE_PASSWORD = 

JWT_SECRET=mysecret
JWT_EXPIRES_IN=90d
JWT_COOKIE_EXPIRES=90 
```
   > **Important:** The `.env` file is included in the `.gitignore` and should not be committed to the repository. Each team member should create their own `.env` file. The `DATABASE_PASSWORD` is empty in this example. Please use your own local MySQL root password or the password for the user you specified.

**Step 4: Set Up the Database**
Connect to your MySQL instance and run the following SQL commands to create the database and the required `users` table.

```sql
-- Create the database (if it doesn't exist)
CREATE DATABASE IF NOT EXISTS `nodejs-login`;

-- Select the database to use
USE `nodejs-login`;

-- Create the users table
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL
);
```

### 3. Running the Application

Once the setup is complete, you can start the server with this command:

```bash
npm start
```

This will launch the application using `nodemon`, which automatically restarts the server whenever you make code changes.

You should see a confirmation message in your terminal:
`Server running on port 5000`

You can now access the application by navigating to **http://localhost:5000** in your web browser.

---

## 📜 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
