// Create a new router
const express = require("express")
const router = express.Router()
const { check, validationResult } = require('express-validator');

// Handle our routes
router.get('/dashboard', function(req, res, next){
    // get all logs and display

    let sqlquery = "SELECT * FROM UserLogs WHERE user_id=?";
    db.query(sqlquery, [req.session.user_id], (err, result) => {
         if (err) {
            next(err)
        }

        res.render("user.ejs", {logs: result})
    });
});

router.post('/add-log', [check('title').notEmpty().isLength({min: 1, max: 100})], function (req, res, next) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        res.redirect('../user/dashboard')
    }
    else {

        // user_id
        // workout_name
        // start_time
        // end_time
        // kg_lifted

        // get user id from current session

        // saving data in database
        let sqlquery = "INSERT INTO UserLogs (user_id, workout_name, start_time) VALUES (?,?,?)"
        // execute sql query
        let newrecord = [req.sanitize(req.session.user_id), req.body.title, new Date().toISOString().slice(0, 19).replace('T', ' ')]
        db.query(sqlquery, newrecord, (err, result) => {
            if (err) {
                next(err)
            }
            else
                res.redirect('../user/dashboard') 
        })
    }
}) 

router.get('/feed', function(req, res, next){
    res.render('feed.ejs')
});

router.post('/post-to-feed', function (req, res, next) {
    // user_log_od
    // title

    // get user id from current session

    // saving data in database
    let sqlquery = "INSERT INTO SharedFeed (user_log_id, title) VALUES (?,?)"
    // execute sql query
    let newrecord = [req.name, "test"]
    db.query(sqlquery, newrecord, (err, result) => {
        if (err) {
            next(err)
        }
        else
            res.redirect('../user/dashboard') 
    })
}) 

router.get('/logout', function(req, res, next){
    // Log user out
});

// Export the router object so index.js can access it
module.exports = router