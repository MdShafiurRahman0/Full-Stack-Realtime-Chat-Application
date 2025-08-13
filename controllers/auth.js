const bcrypt = require('bcryptjs');
const db = require('../config/db');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    const { name, email, password, passwordConfirm } = req.body;

    console.log('Received registration request:', req.body);

    if (!name || !email || !password || !passwordConfirm) {
        return res.render('register', { message: 'Please fill in all fields' });
    }

    if (password !== passwordConfirm) {
        return res.render('register', { message: 'Passwords do not match' });
    }

    db.query('SELECT email FROM users WHERE email = ?', [email], async (error, results) => {
        if (error) {
            console.error('DB error:', error);
            return res.render('register', { message: 'Database error' });
        }

        if (results.length > 0) {
            return res.render('register', { message: 'That email is already in use' });
        }

        try {
            const hashedPassword = await bcrypt.hash(password, 8);

            db.query('INSERT INTO users SET ?', { name, email, password: hashedPassword }, (error, results) => {
                if (error) {
                    console.error('Insert error:', error);
                    return res.render('register', { message: 'User registration failed' });
                }

                console.log('Insert result:', results);
                return res.render('register', { message: 'User registered successfully' });
            });
        } catch (err) {
            console.error('Hashing error:', err);
            return res.render('register', { message: 'Something went wrong' });
        }
    });
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.render('login', {
            message: 'Please provide email and password'
        });
    }

    db.query('SELECT * FROM users WHERE email = ?', [email], async (error, results) => {
        if (error) {
            console.log(error);
        }

        if (results.length === 0 || !(await bcrypt.compare(password, results[0].password))) {
            res.status(401).render('login', {
                message: 'Incorrect email or password'
            });
        } else {
            const id = results[0].id;

            const token = jwt.sign({ id }, process.env.JWT_SECRET, {
                expiresIn: process.env.JWT_EXPIRES_IN
            });

            console.log("The token is: " + token);

            const cookieOptions = {
                expires: new Date(
                    Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
                ),
                httpOnly: true
            }

            res.cookie('jwt', token, cookieOptions);
            res.status(200).redirect("/");
        }
    });
};  // Import the existing connection

exports.register = async (req, res) => {
    const { name, email, password, passwordConfirm } = req.body;

    console.log('Received registration request:', req.body);

    if (!name || !email || !password || !passwordConfirm) {
        return res.render('register', { message: 'Please fill in all fields' });
    }

    if (password !== passwordConfirm) {
        return res.render('register', { message: 'Passwords do not match' });
    }

    db.query('SELECT email FROM users WHERE email = ?', [email], async (error, results) => {
        if (error) {
            console.error('DB error:', error);
            return res.render('register', { message: 'Database error' });
        }

        if (results.length > 0) {
            return res.render('register', { message: 'That email is already in use' });
        }

        try {
            const hashedPassword = await bcrypt.hash(password, 8);

            db.query('INSERT INTO users SET ?', { name, email, password: hashedPassword }, (error, results) => {
                if (error) {
                    console.error('Insert error:', error);
                    return res.render('register', { message: 'User registration failed' });
                }

                console.log('Insert result:', results);
                return res.render('register', { message: 'User registered successfully' });
            });
        } catch (err) {
            console.error('Hashing error:', err);
            return res.render('register', { message: 'Something went wrong' });
        }
    });
};
