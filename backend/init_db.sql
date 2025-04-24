-- Drop the database if it exists, and create it fresh
DROP DATABASE IF EXISTS myproject;
CREATE DATABASE IF NOT EXISTS myproject;
USE myproject;

-- Create the tables
CREATE TABLE IF NOT EXISTS users (
  user_id     INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(100) NOT NULL UNIQUE,
  password    VARCHAR(255) NOT NULL,
  is_admin    TINYINT(1) DEFAULT 0,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS courses (
  course_id    INT AUTO_INCREMENT PRIMARY KEY,
  course_name  VARCHAR(100) NOT NULL,
  description  TEXT NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS user_courses (
  user_id  INT NOT NULL,
  course_id INT NOT NULL,
  PRIMARY KEY (user_id, course_id),
  FOREIGN KEY (user_id)  REFERENCES users(user_id)   ON DELETE CASCADE,
  FOREIGN KEY (course_id)REFERENCES courses(course_id)ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS posts (
  post_id       INT AUTO_INCREMENT PRIMARY KEY,
  user_id       INT NOT NULL,
  course_id     INT NULL,
  content       TEXT NOT NULL,
  post_type     ENUM('seeking', 'offering') NOT NULL DEFAULT 'seeking',
  date_created  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  date_modified TIMESTAMP NULL,
  is_active     TINYINT(1) DEFAULT 1,
  is_reported   TINYINT(1) DEFAULT 0,
  FOREIGN KEY (user_id)  REFERENCES users(user_id)   ON DELETE CASCADE,
  FOREIGN KEY (course_id)REFERENCES courses(course_id)ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS comments (
  comment_id    INT AUTO_INCREMENT PRIMARY KEY,
  post_id       INT NOT NULL,
  user_id       INT NOT NULL,
  content       TEXT NOT NULL,
  parent_id     INT NULL,
  date_created  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id)   REFERENCES posts(post_id)   ON DELETE CASCADE,
  FOREIGN KEY (user_id)   REFERENCES users(user_id)   ON DELETE CASCADE,
  FOREIGN KEY (parent_id) REFERENCES comments(comment_id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS post_reports (
  report_id     INT AUTO_INCREMENT PRIMARY KEY,
  post_id       INT NOT NULL,
  user_id       INT NOT NULL,
  reason        TEXT NOT NULL,
  date_created  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES posts(post_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS study_groups (
  group_id     INT AUTO_INCREMENT PRIMARY KEY,
  title        VARCHAR(150) NOT NULL,
  date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS post_group_associations (
  association_id INT PRIMARY KEY AUTO_INCREMENT,
  post_id INT NOT NULL,
  group_id INT NOT NULL,
  date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES posts(post_id) ON DELETE CASCADE,
  FOREIGN KEY (group_id) REFERENCES study_groups(group_id) ON DELETE CASCADE,
  UNIQUE (post_id)
);

CREATE TABLE IF NOT EXISTS study_group_members (
  group_id INT NOT NULL,
  user_id  INT NOT NULL,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (group_id,user_id),
  FOREIGN KEY (group_id) REFERENCES study_groups(group_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id)  REFERENCES users(user_id)       ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS messages (
  message_id INT AUTO_INCREMENT PRIMARY KEY,
  group_id   INT NOT NULL,
  user_id    INT NOT NULL,
  content    TEXT NOT NULL,
  timestamp  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (group_id) REFERENCES study_groups(group_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id)  REFERENCES users(user_id)        ON DELETE CASCADE
) ENGINE=InnoDB;

-- Insert sample data for testing
INSERT INTO users (name, email, password, is_admin) VALUES 
('Admin User', 'admin@example.com', SHA2('password123', 256), 1),
('John Doe', 'john@example.com', SHA2('password123', 256), 0),
('Jane Smith', 'jane@example.com', SHA2('password123', 256), 0);

INSERT INTO courses (course_name, description) VALUES 
('CPSC 331 - Data Structures', 'Learn about data structures and algorithms for organizing and processing data.'),
('MATH 271 - Discrete Mathematics', 'Introduction to logic, set theory, and discrete mathematics.'),
('CPSC 355 - Computing Machinery', 'Introduction to computer systems and assembly language programming.'),
('PHIL 279 - Logic I', 'Introduction to formal logic and critical thinking.');

-- Enroll users in courses
INSERT INTO user_courses (user_id, course_id) VALUES 
(1, 1), (1, 2),
(2, 1), (2, 3),
(3, 2), (3, 4);

-- Create some posts with post_type explicitly set
INSERT INTO posts (user_id, course_id, content, post_type) VALUES 
(2, 1, 'Looking for a study partner for the upcoming midterm in CPSC 331. Anyone interested?', 'seeking'),
(3, 2, 'Does anyone have the notes from last week''s MATH 271 lecture? I missed the class due to illness.', 'seeking'),
(2, 3, 'I''m organizing a study group for CPSC 355. We''ll be meeting at the library on Friday at 3 PM.', 'offering'),
(3, 4, 'Can someone help me with the homework for PHIL 279? I''m stuck on question 3.', 'seeking');

-- Add some comments to posts
INSERT INTO comments (post_id, user_id, content) VALUES
(1, 3, 'I''m interested! When are you planning to meet?'),
(1, 1, 'Count me in too, I need to study for this midterm.'),
(2, 2, 'I have the notes, I can share them with you.');

-- Create study groups
INSERT INTO study_groups (title) VALUES 
('CPSC 331 Study Group'),
('MATH 271 Study Group');

-- Add members to study groups
INSERT INTO study_group_members (group_id, user_id) VALUES 
(1, 1), (1, 2),
(2, 1), (2, 3);

-- Add some messages
INSERT INTO messages (group_id, user_id, content) VALUES 
(1, 1, 'Welcome to the CPSC 331 Study Group!'),
(1, 2, 'Thanks for creating this group. When should we meet?'),
(1, 1, 'How about Friday at 2 PM in the library?'),
(2, 1, 'Welcome to the MATH 271 Study Group!'),
(2, 3, 'Hi everyone! Looking forward to studying together.'); 