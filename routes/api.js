// Create a new router
const express = require("express")
const router = express.Router()
const request = require('request')

router.get('/exercises', function (req, res, next) {    
    // return all exercises
})

router.get('/stats', function(req, res, next){
    // return global stats page
});

// Export the router object so index.js can access it
module.exports = router
