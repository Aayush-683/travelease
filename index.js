const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const app = express();
const config = require('./config.json');
const port = config.port;
const { QuickDB } = require('quick.db');
const db = new QuickDB({ filePath: './database.sqlite' });
const nodemailer = require('nodemailer');

// Email Setup
let transporter2 = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: config.emailUser,
        pass: config.emailPass
    },
    tls: {
        rejectUnauthorized: false
    }
});

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

// Middleware
app.use((req, res, next) => {
    if (req.session.loggedIn) {
        res.locals.name = req.session.name;
        res.locals.loggedIn = req.session.loggedIn;
    }
    next();
});

// Home Page Route
app.get('/', (req, res) => {
    res.render('index', { name: req.session.name, loggedIn: req.session.loggedIn });
});

// About Us Page Route
app.get('/about', (req, res) => {
    res.render('aboutus');
})

// Authentication Page Route
app.get('/auth', (req, res) => {
    if (req.session.loggedIn) {
        return res.redirect('/');
    }
    res.render('login-signup', { error: false });
});

// Email Verification Page Route
app.get('/verify', (req, res) => {
    if (req.session.loggedIn) {
        return res.redirect('/');
    }
    res.render('verify', { error: false });
});

// Email Verification Post Route
app.post('/auth/verify', async (req, res) => {
    if (req.session.loggedIn) {
        return res.redirect('/');
    }
    let email = req.body.email;
    // Convert Email to Lowercase and replace all dots with underscores
    email = email.toLowerCase();
    email = email.replace(/\./g, '_');
    // Check if Email Exists
    let emailChk = await db.get(`accounts.${email}`);
    if (!emailChk) {
        return res.render('verify', { error: "Email does not exist! Please Signup Instead" });
    }
    // Check if Email is already verified
    let emailVerified = await db.get(`accounts.${email}.verified`);
    if (emailVerified) {
        return res.render('verify', { error: "Email is already verified!" });
    }
    // Generate Random Code
    let code = await generateCode();
    // Save Code
    await db.set(`verification.${code}`, email);
    // Send Verification Email
    await sendVerificationEmail(email, code);
    res.render('verify', { error: "Verification Email Sent!" });
});

// Login Post Route
app.post('/auth/login', async (req, res) => {
    // Check if user is already logged in
    if (req.session.loggedIn) {
        return res.redirect('/');
    }
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
        return res.render('login-signup', { error: "Invalid Password" });
    }
    // Set Session
    let firstName = emailChk.fullName.split(' ')[0];
    req.session.email = email;
    req.session.name = firstName;
    req.session.loggedIn = true;
    res.redirect('/');
});

// Signup Post Route
app.post('/auth/signup', async (req, res) => {
    if (req.session.loggedIn) {
        return res.redirect('/');
    }
    let email = req.body.email;
    let fullName = req.body.name;
    let password = req.body.pass;
    let confirmPassword = req.body.confirmPass;
    if (password !== confirmPassword) {
        return res.render('login-signup', { error: "Passwords do not match" });
    }
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
    // Verification Code
    let code = await generateCode();
    // Save Verification Code
    await db.set(`verification.${code}`, email);
    // Send Verification Email
    await sendVerificationEmail(email, code);
    // Set Verified to False
    let verified = false;
    // Save User Data
    await db.set(`accounts.${email}`, { fullName, password, verified });
    res.render('login-signup', { error: "Account Created Successfully! Please Login" });
});

// Logout Route
app.get('/auth/logout', (req, res) => {
    if (!req.session.loggedIn) {
        return res.redirect('/');
    }
    req.session.destroy();
    res.redirect('/');
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

// Email Verification Function
async function sendVerificationEmail(email, code) {
    let mailOptions = {
        from: config.emailSender,
        to: email,
        subject: "Email Verification",
        // HTML Body with css
        html: `
        <style>
            .container {
                width: 100%;
                text-align: center;
            }
            .button {
                background-color: #4CAF50;
                border: none;
                color: white;
                padding: 15px 32px;
                text-align: center;
                text-decoration: none;
                display: inline-block;
                font-size: 16px;
                margin: 4px 2px;
                cursor: pointer;
            }
            .code {
                font-size: 20px;
            }
            .codeblock {
                background-color: #f2f2f2;
                padding: 10px;
                border-radius: 5px;
            }
        </style>
        <div class="container">
            <h1>Email Verification</h1>
            <p class="code"> Your verification code is: <b class="codeblock">${code}</b></p>
            <p>Please click the button below to verify your email</p>
            <a href="${config.domain}/verify" class="button">Verify Email</a>
        </div>
        `
    };
    await transporter2.sendMail(mailOptions);
}

// Random unique code generator
async function generateCode() {
    // Generate Random Code of 6 Characters
    let code = Math.random().toString(36).substring(2, 8);
    // Convert Code to UpperCase
    code = code.toUpperCase();
    // Check if Code Exists
    let check = await db.get(`verification.${code}`);
    if (check) {
        let newCode = await generateCode();
        return newCode;
    } else {
        return code;
    }
}