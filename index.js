const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const app = express();
const config = require('./config.json');
const port = config.port;
const { QuickDB } = require('quick.db');
const db = new QuickDB({ filePath: './database.sqlite' });

// Express Setup
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(session({
    secret: config.session_secret,
    resave: true,
    saveUninitialized: true
}));
app.set('view engine', 'ejs');
app.set('views', './views');

// Define Routes
app.get('/', (req, res) => {
    if (!req.session.loggedIn) {
        return res.redirect('/auth');
    }
    console.log(req.session);
    res.render('index', { name: req.session.name, loggedIn: req.session.loggedIn });
});
app.get('/auth', (req, res) => {
    res.render('login-signup', { error: false });
});

app.post('/auth/login', async (req, res) => {
    let email = req.body.email;
    let password = req.body.pass;
    // Convert Email to Lowercase and replace all dots with underscores
    email = email.toLowerCase();
    email = email.replace(/\./g, '_');
    // Check if Email Exists
    let emailChk = await db.get(`accounts.${email}`);
    if (!emailChk) {
        return res.render('login-signup', { error: "Email does not exist! Please Signup Instead" });
    }
    // Decrypt Password
    let emailPass = Buffer.from(emailChk.password, 'base64').toString();
    // Compare Passwords
    if (emailPass !== password) {
        console.log(emailPass, password);
        return res.render('login-signup', { error: "Invalid Password" });
    }
    // Set Session
    let firstName = emailChk.fullName.split(' ')[0];
    req.session.email = email;
    req.session.name = firstName;
    req.session.loggedIn = true;
    res.redirect('/');
});

app.post('/auth/signup', async (req, res) => {
    let email = req.body.email;
    let fullName = req.body.name;
    let password = req.body.pass;
    let confirmPassword = req.body.confirmPass;
    if (password !== confirmPassword) {
        return res.render('login-signup', { error: "Passwords do not match" });
    }
    console.log(email, fullName, password);
    // Convert Email to Lowercase and replace all dots with underscores
    email = email.toLowerCase();
    email = email.replace(/\./g, '_');
    // Check if Email Exists
    let emailChk = await db.get(email);
    if (emailChk) {
        return res.render('login-signup', { error: "Email already exists! Please Login Instead" });
    }
    // Encrypt Password
    password = Buffer.from(password).toString('base64');
    // Save User Data
    await db.set(`accounts.${email}`, { fullName, password });
    res.render('login-signup', { error: "Account Created Successfully! Please Login" });
});

// 404 Route
app.use((req, res) => {
    res.status(404).sendFile(__dirname + '/public/404.html');
});

// Start Server
app.listen(port, () => {
    let host = config.domain;
    console.log(`Server started on ${host}:${port}`);
});