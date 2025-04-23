-- Add description column to courses table
ALTER TABLE courses ADD COLUMN description TEXT NULL;

-- Update existing courses with placeholder descriptions
UPDATE courses SET description = 'Course description not provided.' WHERE description IS NULL; 