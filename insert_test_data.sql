USE health;

INSERT INTO Exercises (name, category, description, calories_per_minute) VALUES
('Push-ups', 'Strength', 'Classic bodyweight exercise targeting chest, shoulders, and triceps', 7.0),
('Pull-ups', 'Strength', 'Upper body exercise targeting back and biceps', 8.0),
('Squats', 'Strength', 'Lower body exercise targeting quadriceps, hamstrings, and glutes', 6.0),
('Deadlift', 'Strength', 'Compound exercise for back, legs, and core', 8.5),
('Bench Press', 'Strength', 'Chest exercise using barbell or dumbbells', 7.5),
('Shoulder Press', 'Strength', 'Overhead pressing movement for shoulders', 6.5),
('Bicep Curls', 'Strength', 'Isolation exercise for biceps', 5.0),
('Tricep Dips', 'Strength', 'Bodyweight exercise for triceps', 6.0),
('Lunges', 'Strength', 'Single-leg exercise for legs and balance', 6.0),
('Plank', 'Core', 'Isometric core exercise', 4.0),
('Crunches', 'Core', 'Abdominal exercise targeting rectus abdominis', 5.0),
('Russian Twists', 'Core', 'Rotational core exercise for obliques', 5.5),
('Running', 'Cardio', 'Cardiovascular exercise', 10.0),
('Cycling', 'Cardio', 'Low-impact cardiovascular exercise', 8.0),
('Swimming', 'Cardio', 'Full-body cardiovascular exercise', 9.0),
('Jump Rope', 'Cardio', 'High-intensity cardio exercise', 12.0),
('Burpees', 'Cardio', 'Full-body cardio and strength exercise', 10.0),
('Mountain Climbers', 'Cardio', 'Dynamic cardio exercise', 9.0),
('Yoga', 'Flexibility', 'Mind-body practice for flexibility and relaxation', 3.0),
('Stretching', 'Flexibility', 'Static stretching for flexibility', 2.5),
('Foam Rolling', 'Recovery', 'Self-massage for muscle recovery', 2.0),
('Walking', 'Cardio', 'Low-intensity cardiovascular exercise', 4.0),
('HIIT', 'Cardio', 'High-Intensity Interval Training', 12.0),
('Rowing', 'Cardio', 'Full-body cardio on rowing machine', 8.5),
('Leg Press', 'Strength', 'Machine exercise for legs', 6.0);

INSERT INTO Users (username, first_name, last_name, email, password_hash) VALUES
('gold', 'Gold', 'User', 'gold@example.com', '$2b$10$nuvyszmDSpDQXU2WDAdh6.aZ9BnGjbuflGcJBk/XGgERXPF91dzYG');

INSERT INTO Users (username, first_name, last_name, email, password_hash) VALUES
('testuser', 'Test', 'User', 'test@example.com', '$2b$10$nuvyszmDSpDQXU2WDAdh6.aZ9BnGjbuflGcJBk/XGgERXPF91dzYG');

INSERT INTO Workouts (user_id, name, workout_date, duration_minutes, notes, total_calories, is_shared) VALUES
(1, 'Morning Strength Training', '2024-12-10', 45, 'Great upper body session. Feeling strong today!', 350, TRUE),
(1, 'Cardio Blast', '2024-12-09', 30, 'High intensity running and jump rope', 400, FALSE),
(1, 'Full Body Workout', '2024-12-08', 60, 'Complete workout hitting all muscle groups', 500, TRUE),
(1, 'Leg Day', '2024-12-07', 50, 'Focus on squats and lunges. Legs are burning!', 380, FALSE);

INSERT INTO WorkoutExercises (workout_id, exercise_id, sets, reps, weight_kg, duration_minutes, calories_burned) VALUES
(1, 1, 3, 15, NULL, 5, 35),
(1, 5, 4, 10, 60, 10, 75),
(1, 6, 3, 12, 30, 8, 52),
(1, 7, 3, 12, 15, 6, 30),
(2, 13, 1, NULL, NULL, 20, 200),
(2, 16, 3, 100, NULL, 10, 120),
(3, 1, 3, 15, NULL, 5, 35),
(3, 3, 4, 12, 80, 12, 72),
(3, 13, 1, NULL, NULL, 15, 150),
(3, 10, 3, NULL, NULL, 5, 20),
(4, 3, 5, 10, 100, 15, 90),
(4, 9, 4, 12, NULL, 12, 72),
(4, 25, 4, 10, 120, 10, 60);

INSERT INTO SharedFeed (workout_id, user_id, title, description) VALUES
(1, 1, 'Crushed my upper body workout!', 'Feeling strong today. Increased my bench press by 5kg! Consistency is paying off.'),
(3, 1, 'Full body session complete', 'Mixed cardio and strength for maximum results. Love this balanced approach!');

INSERT INTO Reviews (feed_id, user_id, rating, content) VALUES
(1, 2, 5, 'Great workout! Keep it up! Very inspiring progress.'),
(2, 2, 4, 'Nice balanced routine. Will try this myself.');