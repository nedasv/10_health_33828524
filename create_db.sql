-- Create the database
CREATE DATABASE IF NOT EXISTS health;
USE health;

-- Drop existing tables if they exist
DROP TABLE IF EXISTS Reviews;
DROP TABLE IF EXISTS SharedFeed;
DROP TABLE IF EXISTS WorkoutExercises;
DROP TABLE IF EXISTS Exercises;
DROP TABLE IF EXISTS Workouts;
DROP TABLE IF EXISTS Users;

-- Create user table
CREATE TABLE IF NOT EXISTS Users (
    id INT AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS Exercises (
    id INT AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT,
    calories_per_minute DECIMAL(5,2),
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS Workouts (
    id INT AUTO_INCREMENT,
    user_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    workout_date DATE NOT NULL,
    duration_minutes INT,
    notes TEXT,
    total_calories INT DEFAULT 0,
    is_shared BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES Users(id)
);

CREATE TABLE IF NOT EXISTS WorkoutExercises (
    id INT AUTO_INCREMENT,
    workout_id INT NOT NULL,
    exercise_id INT NOT NULL,
    sets INT DEFAULT 1,
    reps INT,
    weight_kg DECIMAL(6,2),
    duration_minutes INT,
    calories_burned INT,
    PRIMARY KEY (id),
    FOREIGN KEY (workout_id) REFERENCES Workouts(id),
    FOREIGN KEY (exercise_id) REFERENCES Exercises(id)
);

-- Create shared_feed table
CREATE TABLE IF NOT EXISTS SharedFeed (
    id     INT AUTO_INCREMENT NOT NULL,
    workout_id INT NOT NULL,
    user_id INT NOT NULL,
    title VARCHAR(255),
    likes INT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (workout_id) REFERENCES Workouts(id),
    FOREIGN KEY (user_id) REFERENCES Users(id)
);

-- Create review table
CREATE TABLE IF NOT EXISTS Reviews (
    id     INT NOT NULL,
    feed_id INT NOT NULL,
    user_id INT NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (feed_id) REFERENCES SharedFeed(id),
    FOREIGN KEY (user_id) REFERENCES Users(id)
);

CREATE USER IF NOT EXISTS 'health_app'@'localhost' IDENTIFIED BY 'qwertyuiop'; 
GRANT ALL PRIVILEGES ON health.* TO ' health_app'@'localhost';