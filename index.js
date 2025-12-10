// Import express and ejs
var express = require ('express')
var ejs = require('ejs')
const path = require('path')
var session = require ('express-session')
const expressSanitizer = require('express-sanitizer');

// Set up .env file
require('dotenv').config();

// MySQL setup
var mysql = require('mysql2');

// Create the express application object
const app = express()
const port = 8000

app.set('view engine', 'ejs')

// Set up the body parser 
app.use(express.urlencoded({ extended: true }))

// Set up public folder (for css and static js)
app.use(express.static(path.join(__dirname, 'public')))

// Create a session
app.use(session({
    secret: 'somerandomstuff',
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 600000
    }
}))

// Database connection
const db = mysql.createPool({
    host: process.env.HEALTH_HOST,
    user:  process.env.HEALTH_USER,
    password:  process.env.HEALTH_PASSWORD,
    database: process.env.HEALTH_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});
global.db = db;

// Create an input sanitizer
app.use(expressSanitizer());

// Load the route handlers
const mainRoutes = require("./routes/main")
app.use('/', mainRoutes)

const userRoutes = require("./routes/user")
app.use('/user', userRoutes)

// Start the web app listening
app.listen(port, () => console.log(`Example app listening on port ${port}!`))