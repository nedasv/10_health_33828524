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

router.get('/register', function(req, res, next){
    res.render('register.ejs')
});

router.post('/registered', 
    [
        check('email').isEmail(), 
        check('username').isLength({ min: 5, max: 20}), 
        check('password').isLength({min: 8})
    ], function (req, res, next) 
{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.render('./register')
    }
    else { 
        // saving data in database
        const plainPassword = req.body.password
        bcrypt.hash(plainPassword, saltRounds, function(err, hashedPassword) {
            // Store hashed password in your database.
            let sqlquery = "INSERT INTO users (username, first_name, last_name, email, password_hash) VALUES (?,?,?,?,?)"
            // execute sql query
            let newrecord = [req.sanitize(req.body.username), req.sanitize(req.body.first), req.sanitize(req.body.last), req.body.email, hashedPassword]
            db.query(sqlquery, newrecord, (err, result) => {
                if (err) {
                    next(err)
                }
                else
                    result = 'Hello '+ req.sanitize(req.body.first) + ' '+ req.sanitize(req.body.last) +' you are now registered!  We will send an email to you at ' + req.body.email + 'Your password is: '+ req.body.password +' and your hashed password is: '+ hashedPassword
                    res.send(result)
            })
        })         
    }                                                                 
}); 

router.get('/login', function(req, res, next){
    res.render('login.ejs')
});

router.get('/about', function(req, res, next){
    res.render('about.ejs')
});

// Export the router object so index.js can access it
module.exports = router