const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const app = express();
const config = require('./config.json');
const port = config.port;

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
    res.render('index');
});
app.get('/auth',(req,res)=>{
    res.render('login-signup')
})

// Start Server
app.listen(port, () => {
    let host = config.domain;
    console.log(`Server started on ${host}:${port}`);
});