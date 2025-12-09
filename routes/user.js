// Create a new router
const express = require("express")
const router = express.Router()

// Handle our routes
router.get('/dashboard', function(req, res, next){
    res.render('user.ejs')
});

router.get('/feed', function(req, res, next){
    res.render('feed.ejs')
});

router.get('/logout', function(req, res, next){
    // Log user out
});

// Export the router object so index.js can access it
module.exports = router