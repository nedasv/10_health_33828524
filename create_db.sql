# Create the database
CREATE DATABASE IF NOT EXISTS health;
USE health;

# Create user table
CREATE TABLE IF NOT EXISTS Users (
    id INT AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    PRIMARY KEY (id)
);

# Create user_logs table
CREATE TABLE IF NOT EXISTS UserLogs (
    id     INT AUTO_INCREMENT NOT NULL,
    user_id INT NOT NULL,
    workout_name VARCHAR(255) NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    kg_lifted INT,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES Users(id)
);

# Create shared_feed table
CREATE TABLE IF NOT EXISTS SharedFeed (
    id     INT AUTO_INCREMENT NOT NULL,
    user_log_id INT NOT NULL,
    title VARCHAR(255),
    PRIMARY KEY (id),
    FOREIGN KEY (user_log_id) REFERENCES UserLogs(id)
);

# Create review table
CREATE TABLE IF NOT EXISTS Reviews (
    id     INT NOT NULL,
    feed_id INT NOT NULL, 
    user_id INT NOT NULL,
    rating INT NOT NULL,
    content TEXT,
    PRIMARY KEY (id),
    FOREIGN KEY (feed_id) REFERENCES SharedFeed(id)
);

CREATE USER IF NOT EXISTS 'health_app'@'localhost' IDENTIFIED BY 'qwertyuiop'; 
GRANT ALL PRIVILEGES ON health.* TO ' health_app'@'localhost';