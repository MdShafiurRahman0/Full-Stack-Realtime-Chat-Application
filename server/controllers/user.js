const db = require("../config/db");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");

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

exports.logout = (req, res) => {
  try {
    res.cookie("jwt", "loggedout", {
      expires: new Date(Date.now() + 2 * 1000),
      httpOnly: true,
      secure: false,
      sameSite: "strict",
    });

    res.clearCookie("user");

    console.log("User logged out successfully");

    res.redirect("/");
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).send("Logout failed");
  }
};
