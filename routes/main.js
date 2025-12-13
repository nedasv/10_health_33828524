// Create a new router
const express = require("express")
const router = express.Router()

const bcrypt = require('bcrypt')
const saltRounds = 10
const { check, validationResult } = require('express-validator');

// Handle our routes
router.get('/', function(req, res, next){
    res.render('index.ejs')
});

router.get('/about', function(req, res, next) {
    res.render('about.ejs');
});

router.get('/register', function(req, res, next){
    res.render('register.ejs')
});

router.post('/registered', 
    [
        check('email').isEmail().withMessage("Enter valid email"), 
        check('username').isLength({ min: 5, max: 20}).withMessage('Username must be between 5-20 characters'), 
        check('password')
            .isLength({min: 8}).withMessage('Password must be at least 8 characters')
            .matches(/[a-z]/).withMessage('Password must have at least one lowercase letter')
            .matches(/[A-Z]/).withMessage('Password must have at least one uppercase letter')
            .matches(/[0-9]/).withMessage('Password must have at least one number')
            .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('Password must have at least one special character'),
        check('first').notEmpty().withMessage('Must have first name'),
        check('last').notEmpty().withMessage('Must have last name'),
        check('confirmPassword').custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Passwords do not match');
            }
            return true;    
        })
    ], 
    function (req, res, next) {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            // Renders the page but with error msg
            return res.render('register.ejs', {errors: errors.array()})
        } 
        // saving data in database
        const plainPassword = req.body.password
        bcrypt.hash(plainPassword, saltRounds, function(err, hashedPassword) {
            if (err) {
                return next(err);
            }

            // Store hashed password in your database.
            let sqlquery = "INSERT INTO users (username, first_name, last_name, email, password_hash) VALUES (?,?,?,?,?)"
            // execute sql query
            let newrecord = [req.sanitize(req.body.username), req.sanitize(req.body.first), req.sanitize(req.body.last), req.body.email, hashedPassword]
            db.query(sqlquery, newrecord, (err, result) => {
                if (err) {
                    // If database returns error of there already being a duplicate entry
                    if (err.code == 'ER_DUP_ENTRY') {
                        // Renders the page but with error msg
                        return res.render('register.ejs', {errors: [{ msg: 'Username or email already exists' }]})
                    }
                    return next(err)
                }
                res.redirect('./login');
            })
        })                                                                         
    }
); 

router.get('/login', function(req, res, next){
    res.render('login.ejs')
});

router.post('/loggedin', [check('username').notEmpty(), check('password').notEmpty()], function (req, res, next) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        res.render('login.ejs')
    }
    else {
        let sqlquery = "SELECT password_hash, id FROM users WHERE username='" + req.sanitize(req.body.username) + "'"; // query database to get all the books
        // execute sql query
        db.query(sqlquery, (err, result) => {
            if (err) {
                next(err)
            }
            // Compare the password supplied with the password in the database
            if (result[0] !== undefined) {
                bcrypt.compare(req.body.password, result[0].password_hash, function(err, bcrypt_result) {
                if (err) {
                    res.send(err.message)
                }
                else if (bcrypt_result == true) {
                    // Save user session here, when login is successful
                    req.session.user_id = req.sanitize(result[0].id);
                    console.log(req.session.user_id)
                    res.redirect('../user/dashboard') 
                }
                else {
                    // Show inncorect password msg
                }
                })
            }
        });
    }
})

router.get('/about', function(req, res, next){
    res.render('about.ejs')
});

// Export the router object so index.js can access it
module.exports = router