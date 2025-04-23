-- Add description column to courses table
ALTER TABLE courses ADD COLUMN description TEXT NULL;

-- Update existing courses with descriptions
UPDATE courses SET description = 'Learn about data structures and algorithms for organizing and processing data.' WHERE course_name = 'CPSC 331 - Data Structures';
UPDATE courses SET description = 'Introduction to logic, set theory, and discrete mathematics.' WHERE course_name = 'MATH 271 - Discrete Mathematics';
UPDATE courses SET description = 'Introduction to computer systems and assembly language programming.' WHERE course_name = 'CPSC 355 - Computing Machinery';
UPDATE courses SET description = 'Introduction to formal logic and critical thinking.' WHERE course_name = 'PHIL 279 - Logic I'; 