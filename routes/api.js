// Create a new router
const express = require("express")
const router = express.Router()
const request = require('request')

router.post('/post', function (req, res, next) {    
    // Execute the sql query
    // db.query(sqlquery, (err, result) => {
    //     // Return results as a JSON object
    //     if (err) {
    //         res.json(err)
    //         next(err)
    //     }
    //     else {
    //         res.json(result)
    //     }
    // })

    res.json({
        success: true,
        received: req.body,
        serverMessage: 'Data received successfully!'
    });
})

// Export the router object so index.js can access it
module.exports = router
