// Create a new router
const express = require("express")
const router = express.Router()
const request = require('request')

router.get('/stats', function(req, res, next) {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const userId = req.session.user.id;
    
    let sqlquery = `
        SELECT 
            COUNT(*) as totalWorkouts,
            COALESCE(SUM(total_calories), 0) as totalCalories,
            COALESCE(SUM(duration_minutes), 0) as totalMinutes
        FROM Workouts 
        WHERE user_id = ?
    `;
    
    db.query(sqlquery, [userId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results[0]);
    });
});

router.get('/exercises', function(req, res, next) {
    const category = req.query.category || '';
    
    let sqlquery = "SELECT * FROM Exercises";
    let params = [];
    
    if (category) {
        sqlquery += " WHERE category = ?";
        params.push(category);
    }
    
    sqlquery += " ORDER BY name";
    
    db.query(sqlquery, params, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
});

// Export the router object so index.js can access it
module.exports = router
