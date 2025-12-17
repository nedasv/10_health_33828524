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
            return res.render('register.ejs', {errors: errors.array(), data: req.body})
        } 
        // saving data in database
        const plainPassword = req.body.password
        bcrypt.hash(plainPassword, saltRounds, function(err, hashedPassword) {
            if (err) {
                return next(err);
            }

            // Store hashed password in your database.
            let sqlquery = "INSERT INTO Users (username, first_name, last_name, email, password_hash) VALUES (?,?,?,?,?)"
            // execute sql query
            let newrecord = [req.sanitize(req.body.username), req.sanitize(req.body.first), req.sanitize(req.body.last), req.body.email, hashedPassword]
            db.query(sqlquery, newrecord, (err, result) => {
                if (err) {
                    // If database returns error of there already being a duplicate entry
                    if (err.code == 'ER_DUP_ENTRY') {
                        // Renders the page but with error msg
                        return res.render('register.ejs', {errors: [{ msg: 'Username or email already exists' }], data: req.body})
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

router.post('/loggedin', 
    [
        check('username').notEmpty().withMessage('Username is required'), 
        check('password').notEmpty().withMessage('Password is required')
    ], 
    function (req, res, next) {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            res.render('login.ejs', {error: "Fill in all fields"})
        }
        else {
            let sqlquery = "SELECT * FROM Users WHERE username=?"
            // execute sql query
            db.query(sqlquery, [req.sanitize(req.body.username)], (err, result) => {
                if (err) {
                    next(err)
                }

                if (result != undefined) {
                    if (result.length === 0) {
                    return res.render('login.ejs', {error: 'Invalid username or password'});
                    }
                }
            
                // Compare the password supplied with the password in the database
                if (result[0] !== undefined) {
                    bcrypt.compare(req.body.password, result[0].password_hash, function(err, bcrypt_result) {
                        if (err) {
                            return next(err);
                        } else if (bcrypt_result === true) {
                            // Save user session here, when login is successful

                            req.session.user = {
                                id: result[0].id,
                                username: result[0].username,
                                first_name: result[0].first_name,
                                last_name: result[0].last_name,
                                email: result[0].email,
                            }

                            console.log(req.session.user_id)
                            res.redirect('./user/dashboard') 
                        } else {
                            // Show inncorect password msg
                            res.render('login.ejs', {error: 'Invalid username or password'});
                        }
                        }
                    )
                }
            });
        }
    }
)

router.get('/search', function(req, res, next) {
    const query = req.query.q || '';
    const searchType = req.query.type || 'workouts';
    const category = req.query.category || '';
    
    if (!query && !category) {
        return res.render('search.ejs', { 
            user: req.session.user || null,
            results: null,
            query: '',
            searchType: searchType
        });
    }
    
    let sqlquery;
    let params = [];
    
    if (searchType === 'exercises') {
        if (category) {
            sqlquery = "SELECT * FROM Exercises WHERE category = ? ORDER BY name";
            params = [category];
        } else {
            sqlquery = "SELECT * FROM Exercises WHERE name LIKE ? OR category LIKE ? OR description LIKE ? ORDER BY name";
            params = [`%${query}%`, `%${query}%`, `%${query}%`];
        }
    } else if (searchType === 'users') {
        sqlquery = "SELECT id, username, first_name, last_name FROM Users WHERE username LIKE ? OR first_name LIKE ? OR last_name LIKE ? ORDER BY username";
        params = [`%${query}%`, `%${query}%`, `%${query}%`];
    } else {
        // Search shared workouts
        sqlquery = `
            SELECT w.*, u.first_name, u.last_name, u.username 
            FROM Workouts w 
            JOIN Users u ON w.user_id = u.id 
            WHERE w.is_shared = TRUE 
            AND (w.name LIKE ? OR w.notes LIKE ? OR u.username LIKE ?)
            ORDER BY w.workout_date DESC
        `;
        params = [`%${query}%`, `%${query}%`, `%${query}%`];
    }
    
    db.query(sqlquery, params, (err, results) => {
        if (err) {
            return next(err);
        }
        
        res.render('search.ejs', { 
            user: req.session.user || null,
            results: results,
            totalResults: results.length,
            query: query,
            searchType: searchType
        });
    });
});

router.get('/feed', function(req, res, next) {
    let sqlquery = `
        SELECT sf.*, w.name as workout_name, w.workout_date, w.duration_minutes, w.total_calories,
               u.first_name, u.last_name, u.username,
               (SELECT AVG(rating) FROM Reviews WHERE feed_id = sf.id) as avg_rating,
               (SELECT COUNT(*) FROM Reviews WHERE feed_id = sf.id) as review_count
        FROM SharedFeed sf
        JOIN Workouts w ON sf.workout_id = w.id
        JOIN Users u ON sf.user_id = u.id
        ORDER BY sf.created_at DESC
        LIMIT 20
    `;
    
    db.query(sqlquery, (err, feedItems) => {
        if (err) {
            return next(err);
        }
        
        // Get reviews for each feed item
        const feedIds = feedItems.map(item => item.id);
        
        if (feedIds.length > 0) {
            let reviewQuery = `
                SELECT r.*, u.first_name as reviewer_name
                FROM Reviews r
                JOIN Users u ON r.user_id = u.id
                WHERE r.feed_id IN (?)
                ORDER BY r.created_at DESC
            `;
            
            db.query(reviewQuery, [feedIds], (err, reviews) => {
                if (err) {
                    return next(err);
                }
                
                // Attach reviews to feed items
                feedItems.forEach(item => {
                    item.reviews = reviews.filter(r => r.feed_id === item.id).slice(0, 3);
                });
                
                res.render('feed.ejs', { 
                    user: req.session.user || null,
                    feedItems: feedItems,
                    message: req.query.message || null
                });
            });
        } else {
            res.render('feed.ejs', { 
                user: req.session.user || null,
                feedItems: [],
                message: req.query.message || null
            });
        }
    });
});

router.post('/feed/:id/review', function(req, res, next) {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    
    const feedId = req.params.id;
    const userId = req.session.user.id;
    const rating = parseInt(req.body.rating);
    const content = req.sanitize(req.body.content) || '';
    
    if (!rating || rating < 1 || rating > 5) {
        return res.redirect('/feed');
    }
    
    let sqlquery = "INSERT INTO Reviews (feed_id, user_id, rating, content) VALUES (?, ?, ?, ?)";
    
    db.query(sqlquery, [feedId, userId, rating, content], (err, result) => {
        if (err) {
            return next(err);
        }
        res.redirect('/feed');
    });
});

// Export the router object so index.js can access it
module.exports = router