# Node.js & MySQL Authentication Project

This project is a simple web application that demonstrates user authentication using Node.js, Express, and MySQL. It includes features such as user registration, login, and logout, with secure password hashing and JWT-based authentication.

## Features

*   **User Registration:** New users can register with their name, email, and password. Passwords are securely hashed using `bcryptjs` before being stored in the database.
*   **User Login:** Registered users can log in with their email and password. Upon successful authentication, a JSON Web Token (JWT) is generated and stored in a cookie for session management.
*   **Persistent Login:** Users remain logged in across sessions, thanks to the JWT stored in a cookie.
*   **Logout:** Logged-in users can securely log out, which clears the authentication cookie.
*   **Protected Routes:** The home page is a protected route that only logged-in users can fully access, displaying a personalized welcome message.

## Technology Stack

*   **Backend:** Node.js, Express.js
*   **Database:** MySQL
*   **Authentication:** JSON Web Tokens (JWT), `bcryptjs`
*   **Templating Engine:** Handlebars (HBS)
*   **Frontend:** HTML, CSS, Bootstrap

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

*   Node.js and npm installed on your machine.
*   A running MySQL server.

### Installation

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/MdShafiurRahman0/Full-Stack-Realtime-Chat-Application.git
    cd your-repo-name
    ```

2.  **Install the dependencies:**
    ```sh
    npm install
    ```

3.  **Set up the database:**
    *   Create a new database in your MySQL server.
    *   Create a `users` table in the database using the following schema:
        ```sql
        CREATE TABLE users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL
        );
        ```

4.  **Create a `.env` file:**
    *   In the root of the project, create a file named `.env`.
    *   Add the following environment variables to the `.env` file, replacing the values with your own:
        ```
        DATABASE_HOST=your_database_host
        DATABASE_USER=your_database_user
        DATABASE_PASSWORD=your_database_password
        DATABASE_NAME=your_database_name
        JWT_SECRET=your_jwt_secret
        JWT_EXPIRES_IN=90d
        JWT_COOKIE_EXPIRES=90
        ```

### Usage

To run the application, execute the following command from the project's root directory:

```sh
npm start
```

The application will be available at `http://localhost:5000`.

## Live Preview

<video src="https://www.w3schools.com/html/mov_bbb.webm" controls="controls" style="max-width: 720px;">
</video>

## Screenshots

*You can add screenshots of your application here to showcase its features.*

### Home Page (Logged Out)
![Home Page (Logged Out)](https://via.placeholder.com/468x300?text=Home+Page+Logged+Out)

### Register Page
![Register Page](https://via.placeholder.com/468x300?text=Register+Page)

### Login Page
![Login Page](https://via.placeholder.com/468x300?text=Login+Page)

### Home Page (Logged In)
![Home Page (Logged In)](https://via.placeholder.com/468x300?text=Home+Page+Logged+In)


[Watch Demo Video](public/screen-capture.webm)

