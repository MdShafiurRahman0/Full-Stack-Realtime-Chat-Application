const db = require('../config/db');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');

exports.isLoggedIn = async (req, res, next) => {
    if (req.cookies.jwt) {
        try {
            // 1) verify token
            const decoded = await promisify(jwt.verify)(
                req.cookies.jwt,
                process.env.JWT_SECRET
            );

            // 2) Check if user still exists
            db.query('SELECT * FROM users WHERE id = ?', [decoded.id], (error, result) => {
                if (!result) {
                    return next();
                }
                req.user = result[0];
                return next();
            });
        } catch (err) {
            return next();
        }
    } else {
        next();
    }
};

exports.logout = (req, res) => {
    res.cookie('jwt', 'logout', {
        expires: new Date(Date.now() + 2 * 1000),
        httpOnly: true
    });
    res.status(200).redirect('/');
};