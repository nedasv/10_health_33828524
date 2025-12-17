// Create a new router
const express = require("express")
const router = express.Router()
const { check, validationResult } = require('express-validator');

// Handle our routes
router.get('/dashboard', function(req, res, next) {
    const userId = req.session.user.id;
    
    // user statistics
    let statsQuery = `
        SELECT 
            COUNT(*) as totalWorkouts,
            COALESCE(SUM(total_calories), 0) as totalCalories,
            COALESCE(SUM(duration_minutes), 0) as totalMinutes,
            (SELECT COUNT(*) FROM Workouts WHERE user_id = ? AND workout_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)) as thisWeek
        FROM Workouts 
        WHERE user_id = ?
    `;
    
    db.query(statsQuery, [userId, userId], (err, statsResult) => {
        if (err) {
            return next(err);
        }
        
        // recent workouts
        let workoutsQuery = `
            SELECT * FROM Workouts 
            WHERE user_id = ? 
            ORDER BY workout_date DESC 
            LIMIT 6
        `;
        
        db.query(workoutsQuery, [userId], (err, workouts) => {
            if (err) {
                return next(err);
            }
            
            res.render('user.ejs', {
                user: req.session.user,
                stats: statsResult[0] || { totalWorkouts: 0, totalCalories: 0, totalMinutes: 0, thisWeek: 0 },
                workouts: workouts,
                message: req.query.message || null
            });
        });
    });
});

// All workouts list
router.get('/workouts', function(req, res, next) {
    const userId = req.session.user.id;
    
    let sqlquery = `
        SELECT * FROM Workouts 
        WHERE user_id = ? 
        ORDER BY workout_date DESC
    `;
    
    db.query(sqlquery, [userId], (err, workouts) => {
        if (err) {
            return next(err);
        }
        
        res.render('workouts.ejs', {
            user: req.session.user,
            workouts: workouts,
            message: req.query.message || null
        });
    });
});

// New workout form
router.get('/workouts/new', function(req, res, next) {
    // Get exercises for dropdown
    let sqlquery = "SELECT * FROM Exercises ORDER BY category, name";
    
    db.query(sqlquery, (err, exercises) => {
        if (err) {
            return next(err);
        }
        
        res.render('workout-new.ejs', {
            user: req.session.user,
            exercises: exercises,
            errors: null,
            formData: {}
        });
    });
});

// Create new workout
router.post('/workouts/new', 
    [
        check('name').notEmpty().withMessage('Workout name is required').isLength({max: 255}).withMessage('Name too long'),
        check('workout_date').notEmpty().withMessage('Date is required').isDate().withMessage('Invalid date'),
        check('duration_minutes').optional({checkFalsy: true}).isInt({min: 1, max: 480}).withMessage('Duration must be between 1-480 minutes')
    ],
    function(req, res, next) {
        const errors = validationResult(req);
        
        if (!errors.isEmpty()) {
            let sqlquery = "SELECT * FROM Exercises ORDER BY category, name";
            return db.query(sqlquery, (err, exercises) => {
                res.render('workout-new.ejs', {
                    user: req.session.user,
                    exercises: exercises || [],
                    errors: errors.array(),
                    formData: req.body
                });
            });
        }
        
        const userId = req.session.user.id;
        const name = req.sanitize(req.body.name);
        const workoutDate = req.body.workout_date;
        const durationMinutes = req.body.duration_minutes || null;
        const notes = req.sanitize(req.body.notes) || null;
        
        // Calculate total calories from exercises
        let totalCalories = 0;
        const exerciseIds = req.body.exercise_id || [];
        const sets = req.body.sets || [];
        const reps = req.body.reps || [];
        const weights = req.body.weight_kg || [];
        const durations = req.body.exercise_duration || [];
        
        // Insert workout
        let sqlquery = "INSERT INTO Workouts (user_id, name, workout_date, duration_minutes, notes, total_calories) VALUES (?, ?, ?, ?, ?, ?)";
        
        db.query(sqlquery, [userId, name, workoutDate, durationMinutes, notes, 0], (err, result) => {
            if (err) {
                return next(err);
            }
            
            const workoutId = result.insertId;
            
            // Insert exercises if any
            if (Array.isArray(exerciseIds) && exerciseIds.length > 0) {
                const validExercises = exerciseIds.filter((id, idx) => id);
                
                if (validExercises.length > 0) {
                    // Get calories per minute for each exercise
                    db.query("SELECT id, calories_per_minute FROM Exercises WHERE id IN (?)", [validExercises], (err, exerciseData) => {
                        if (err) {
                            return res.redirect('./user/dashboard?message=Workout created');
                        }
                        
                        const caloriesMap = {};
                        exerciseData.forEach(ex => {
                            caloriesMap[ex.id] = ex.calories_per_minute || 5;
                        });
                        
                        let exerciseInserts = [];
                        let exerciseValues = [];
                        
                        exerciseIds.forEach((exId, idx) => {
                            if (exId) {
                                const exDuration = durations[idx] || 10;
                                const calories = Math.round((caloriesMap[exId] || 5) * exDuration);
                                totalCalories += calories;
                                
                                exerciseInserts.push("(?, ?, ?, ?, ?, ?, ?)");
                                exerciseValues.push(
                                    workoutId,
                                    exId,
                                    sets[idx] || 1,
                                    reps[idx] || null,
                                    weights[idx] || null,
                                    exDuration,
                                    calories
                                );
                            }
                        });
                        
                        if (exerciseInserts.length > 0) {
                            let insertExercisesQuery = `
                                INSERT INTO WorkoutExercises (workout_id, exercise_id, sets, reps, weight_kg, duration_minutes, calories_burned) 
                                VALUES ${exerciseInserts.join(', ')}
                            `;
                            
                            db.query(insertExercisesQuery, exerciseValues, (err) => {
                                if (err) {
                                    console.error('Error inserting exercises:', err);
                                }
                                
                                // Update total calories
                                db.query("UPDATE Workouts SET total_calories = ? WHERE id = ?", [totalCalories, workoutId], (err) => {
                                    res.redirect('./user/dashboard?message=Workout logged successfully');
                                });
                            });
                        } else {
                            res.redirect('./user/dashboard?message=Workout logged successfully');
                        }
                    });
                } else {
                    res.redirect('./user/dashboard?message=Workout logged successfully');
                }
            } else {
                res.redirect('./user/dashboard?message=Workout logged successfully');
            }
        });
    }
);

// View workout detail
router.get('/workouts/:id', function(req, res, next) {
    const userId = req.session.user.id;
    const workoutId = req.params.id;
    
    let workoutQuery = "SELECT * FROM Workouts WHERE id = ? AND user_id = ?";
    
    db.query(workoutQuery, [workoutId, userId], (err, workoutResult) => {
        if (err) {
            return next(err);
        }
        
        if (workoutResult.length === 0) {
            return res.redirect('./user/workouts');
        }
        
        let exercisesQuery = `
            SELECT we.*, e.name, e.category, e.description
            FROM WorkoutExercises we
            JOIN Exercises e ON we.exercise_id = e.id
            WHERE we.workout_id = ?
        `;
        
        db.query(exercisesQuery, [workoutId], (err, exercises) => {
            if (err) {
                return next(err);
            }
            
            res.render('workout-detail.ejs', {
                user: req.session.user,
                workout: workoutResult[0],
                exercises: exercises,
                message: req.query.message || null
            });
        });
    });
});

// Edit workout form
router.get('/workouts/:id/edit', function(req, res, next) {
    const userId = req.session.user.id;
    const workoutId = req.params.id;
    
    let sqlquery = "SELECT * FROM Workouts WHERE id = ? AND user_id = ?";
    
    db.query(sqlquery, [workoutId, userId], (err, result) => {
        if (err) {
            return next(err);
        }
        
        if (result.length === 0) {
            return res.redirect('./user/workouts');
        }
        
        res.render('workout-edit.ejs', {
            user: req.session.user,
            workout: result[0],
            errors: null
        });
    });
});

// Update workout
router.post('/workouts/:id/edit', 
    [
        check('name').notEmpty().withMessage('Workout name is required'),
        check('workout_date').notEmpty().withMessage('Date is required')
    ],
    function(req, res, next) {
        const errors = validationResult(req);
        const userId = req.session.user.id;
        const workoutId = req.params.id;
        
        if (!errors.isEmpty()) {
            return db.query("SELECT * FROM Workouts WHERE id = ? AND user_id = ?", [workoutId, userId], (err, result) => {
                if (err || result.length === 0) {
                    return res.redirect('./user/workouts');
                }
                res.render('workout-edit.ejs', {
                    user: req.session.user,
                    workout: result[0],
                    errors: errors.array()
                });
            });
        }
        
        const name = req.sanitize(req.body.name);
        const workoutDate = req.body.workout_date;
        const durationMinutes = req.body.duration_minutes || null;
        const notes = req.sanitize(req.body.notes) || null;
        
        let sqlquery = "UPDATE Workouts SET name = ?, workout_date = ?, duration_minutes = ?, notes = ? WHERE id = ? AND user_id = ?";
        
        db.query(sqlquery, [name, workoutDate, durationMinutes, notes, workoutId, userId], (err, result) => {
            if (err) {
                return next(err);
            }
            res.redirect('./user/workouts/' + workoutId + '?message=Workout updated successfully');
        });
    }
);

// Delete workout
router.post('/workouts/:id/delete', function(req, res, next) {
    const userId = req.session.user.id;
    const workoutId = req.params.id;
    
    let sqlquery = "DELETE FROM Workouts WHERE id = ? AND user_id = ?";
    
    db.query(sqlquery, [workoutId, userId], (err, result) => {
        if (err) {
            return next(err);
        }
        res.redirect('./user/workouts?message=Workout deleted successfully');
    });
});

// Share workout to community feed
router.post('/workouts/:id/share', function(req, res, next) {
    const userId = req.session.user.id;
    const workoutId = req.params.id;
    
    // Verify workout belongs to user
    db.query("SELECT * FROM Workouts WHERE id = ? AND user_id = ?", [workoutId, userId], (err, result) => {
        if (err) {
            return next(err);
        }
        
        if (result.length === 0) {
            return res.redirect('./user/workouts');
        }
        
        const workout = result[0];
        const title = req.body.title || workout.name;
        const description = req.sanitize(req.body.description) || '';
        
        // Create feed post
        let insertQuery = "INSERT INTO SharedFeed (workout_id, user_id, title, description) VALUES (?, ?, ?, ?)";
        
        db.query(insertQuery, [workoutId, userId, title, description], (err, insertResult) => {
            if (err) {
                return next(err);
            }
            
            // Mark workout as shared
            db.query("UPDATE Workouts SET is_shared = TRUE WHERE id = ?", [workoutId], (err) => {
                if (err) {
                    console.error('Error updating workout:', err);
                }
                res.redirect('./feed?message=Workout shared to community!');
            });
        });
    });
});

router.get('/logout', function(req, res, next){
    // Log user out
});

// Export the router object so index.js can access it
module.exports = router