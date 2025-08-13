const express = require("express");
const path = require('path');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');

dotenv.config({ path: './.env' });

const app = express();

const publicDirectory = path.join(__dirname, './public');
app.use(express.static(publicDirectory));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

app.set('view engine', 'hbs');

// Define routes
app.use('/', require('./routes/pages'));
app.use('/auth', require('./routes/auth'));

// Start server
app.listen(5000, () => {
    console.log("Server running on port 5000");
});
