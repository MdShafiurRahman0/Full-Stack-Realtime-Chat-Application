const express = require('express');
const userController = require('../controllers/user');

const router = express.Router();

router.get('/', userController.isLoggedIn, (req, res) => {
    res.render('index', { user: req.user });
});

router.get('/register', (req, res) => {
    res.render('register');
});

router.get('/login', (req, res) => {
    res.render('login');
});

router.get('/logout', userController.logout);

module.exports = router;