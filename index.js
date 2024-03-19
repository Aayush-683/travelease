const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const app = express();
const config = require('./config.json');
const port = config.port;
const { QuickDB } = require('quick.db');
const db = new QuickDB({ filePath: './database.sqlite' });
const nodemailer = require('nodemailer');
const searchImage = require('g-i-s');
const fs = require('fs');
const Weather = require("@tinoschroeter/weather-js");
const weather = new Weather();
const { G4F } = require('g4f');
const g4f = new G4F();

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
//home page 
app.get('/home', (req, res) => {
    res.render('home', { name: req.session.name, loggedIn: req.session.loggedIn });
});

// About Us Page Route
app.get('/about', (req, res) => {
    res.render('aboutus');
})

//itinerary display
app.get('/itinerary', (req, res) => {
    res.render('itinerary2');
})

//contact us page
app.get('/contactus', (req, res) => {
    res.render('contactusindex');
})
    
// Authentication Page Route
app.get('/auth', (req, res) => {
    if (req.session.loggedIn) {
        return res.redirect('/');
    }
    res.render('login-signup', { error: false });
});

// My Account Page Route
app.get('/me', (req, res) => {
    if (!req.session.loggedIn) {
        return res.redirect('/');
    }
    res.render('account', { error: false, req: req });
});

// Email Verification Page Route
app.get('/me/verifymail', async (req, res) => {
    if (!req.session.loggedIn) {
        return res.redirect('/');
    }
    let email = req.session.email;
    let code = req.query.code;
    // Check if Email Exists
    let emailChk = db.get(`accounts.${email}`);
    if (!emailChk) {
        return res.render('account', { error: "Email does not exist! Please Signup Instead" });
    }
    // Check if Email is already verified
    let emailVerified = await db.get(`accounts.${email}.verified`);
    if (emailVerified) {
        return res.render('account', { error: "Email is already verified!" });
    }
    // Check if Code Exists
    let emailCode = await db.get(`verification.${code}`);
    if (!emailCode) {
        return res.render('verify', { error: "Invalid Code!" });
    }
    // Check if Code Matches
    email = email.replace(/\_/g, '.')
    if (emailCode !== email) {
        return res.render('verify', { error: "Invalid Code!" });
    }
    // Set Email to Verified
    await db.set(`accounts.${email}.verified`, true);
    await db.delete(`verification.${code}`);
    // Update Session
    req.session.verfiedMail = true;
    res.render('account', { error: "Email Verified Successfully!" });
});

// Email Verification Post Route
app.post('/auth/verify_email', async (req, res) => {
    if (!req.session.loggedIn) {
        return res.redirect('/auth');
    }
    let email = req.session.email;
    // Check if Email Exists
    let emailChk = await db.get(`accounts.${email}`);
    if (!emailChk) {
        return res.render('account', { error: "Email does not exist! Please Signup Instead" });
    }
    // Check if Email is already verified
    let emailVerified = await db.get(`accounts.${email}.verified`);
    if (emailVerified) {
        return res.render('account', { error: "Email is already verified!" });
    }
    // Generate Random Code
    let code = await generateCode();
    email = email.replace(/\_/g, '.')
    // Send Verification Email
    await sendVerificationEmail(email, code);
    await db.set(`verification.${code}`, email);
    res.render('verify', { error: "Verification Email Sent!" });
});

// Login Post Route
app.post('/auth/login', async (req, res) => {
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
    req.session.verifiedMail = emailChk.verified;
    res.redirect('/');
});

app.get('/gen/itinerary', (req, res) => {
    res.render('itinerary', { itinerary: false, req: req, error: false });
});

app.post('/gen/itinerary', async (req, res) => {
    let days = req.body.days;
    let city = req.body.city;
    let country = req.body.country;
    let currency = req.body.currency;
    let place = `${city}, ${country}.`;
    let members = req.body.members;
    let budget = req.body.budget;
    if (members < 1) {
        return res.render('itinerary', { itinerary: false, req: req, error: "Invalid Number of Members" });
    } else if (days < 1) {
        return res.render('itinerary', { itinerary: false, req: req, error: "Invalid Number of Days" });
    } else if (budget < 1) {
        return res.render('itinerary', { itinerary: false, req: req, error: "Invalid Budget" });
    } else if (!city || !country || !currency) {
        return res.render('itinerary', { itinerary: false, req: req, error: "Invalid Place" });
    }
    // Generate Itinerary
    let cost = `${budget} ${currency}`;
    let generated = await generateItinerary(days, place, members, cost);
    if (generated === "Error") {
        return res.render('itinerary', { itinerary: false, req: req, error: "There was an error generating the itinerary, please try again later" });
    } else if (generated === "Rate limit exceeded") {
        return res.render('itinerary', { itinerary: false, req: req, error: "Server Busy! Please Try Again in a Few Minutes" });
    } else if (!generated) {
        return res.render('itinerary', { itinerary: false, req: req, error: "Error Generating Itinerary..." });
    }
    // convert text to json
    try {
        generated = JSON.parse(generated);
    } catch (err) {
        console.log(generated);
        return res.render('itinerary', { itinerary: false, req: req, error: "Error Generating Itinerary" });
    }
    let itinerary = generated.itinerary;
    // Generate Image for each accommodation and restaurant
    for (let i = 0; i < itinerary.length; i++) {
        let accomodations = itinerary[i].accommodations;
        let restaurants = itinerary[i].restaurants;
        for (let j = 0; j < accomodations.length; j++) {
            let name = accomodations[j].name;
            let image = await searchImageByQuery(name);
            itinerary[i].accommodations[j].image = image;
        }
        for (let k = 0; k < restaurants.length; k++) {
            let name = restaurants[k].name;
            let image = await searchImageByQuery(name);
            itinerary[i].restaurants[k].image = image;
        }
    }
    // Get Weather Data
    let w = await getWeatherData(city, country);
    let weather_return = false;
    if (w === "Error") {
        weather_return = false;
    } else if (!w) {
        weather_return = false;
    } else {
        weather_return = w;
    }
    // Render Itinerary
    res.render('itinerary', { itinerary: itinerary, req: req, error: false, weather: weather_return });
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
    let verified = false;
    // Save User Data
    await db.set(`accounts.${email}`, { fullName, password, verified });
    // Verification Code
    let code = await generateCode();
    email = email.replace(/\_/g, '.')
    // Send Verification Email
    await sendVerificationEmail(email, code);
    await db.set(`verification.${code}`, email);
    // Set Verified to False
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
            <a href="${config.domain}/me/verifymail" class="button">Verify Email</a>
        </div>
        `
    };
    try {
        await transporter2.sendMail(mailOptions);
    } catch (err) {
        console.log(err);
    }
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

// Image Search Function
async function searchImageByQuery(query) {
    let si = false;
    si = await new Promise((resolve, reject) => {
        searchImage(query, async (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results[0].url);
            }
        });
    });
    return si;
}

// Fetch weather function
async function getWeatherData(city, country) {
    let place = `${city}, ${country}`;
    let www = false;
    let weatherData;
    try {
        weatherData = await weather.find({
            search: place,
            degreeType: "C",
        });
    } catch (err) { 
        console.log(err);
        return "Error";
    }
    console.log(weatherData)
    www = {
        temp: weatherData[0].current.temperature,
        desc: weatherData[0].current.skytext,
        humidity: weatherData[0].current.humidity,
        wind: weatherData[0].current.winddisplay,
        image: weatherData[0].current.imageUrl,
        forecast: []
    }
    await new Promise((resolve, reject) => {
        for (let i = 0; i < weatherData[0].forecast.length; i++) {
            let forecast = {
                day: weatherData[0].forecast[i].day,
                low: weatherData[0].forecast[i].low,
                high: weatherData[0].forecast[i].high,
                desc: weatherData[0].forecast[i].skytextday
            }
            www.forecast.push(forecast);
        }
        resolve();
    });
    return www;
}

// Itinerary Generation Function
async function generateItinerary(days, place, members, budget) {
    let prompt = fs.readFileSync('prompt.txt', 'utf8');
    prompt = prompt.replace("AAAA", days);
    prompt = prompt.replace("BBBB", place);
    prompt = prompt.replace("CCCC", budget);
    prompt = prompt.replace("DDDD", members);
    let response;
    try {
        const messages = [
            {
                role: "system",
                content: prompt
            }
        ];
        response = await g4f.chatCompletion(messages)
    } catch (err) {
        console.log(err);
        return "Error";
    }
    console.log(response)
    return response;
}