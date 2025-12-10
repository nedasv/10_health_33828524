# Create the database
CREATE DATABASE IF NOT EXISTS health;
USE health;

# Create user table
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL
);

# Create user_logs table
CREATE TABLE IF NOT EXISTS user_logs (
    id     INT PRIMARY KEY NOT NULL,
    user_id INT NOT NULL
);

# Create shared_feed table
CREATE TABLE IF NOT EXISTS shared_feed (
    id     INT PRIMARY KEY NOT NULL,
    user_id INT NOT NULL,
    content VARCHAR(255)
);

CREATE USER IF NOT EXISTS 'health_app'@'localhost' IDENTIFIED BY 'qwertyuiop'; 
GRANT ALL PRIVILEGES ON health.* TO ' health_app'@'localhost';