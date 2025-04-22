USE myproject;

-- Add post_type column to posts table if it doesn't exist
ALTER TABLE posts 
ADD COLUMN post_type ENUM('seeking', 'offering') 
NOT NULL DEFAULT 'seeking';

-- Update existing posts - make odd-numbered posts 'offering' and even 'seeking'
UPDATE posts 
SET post_type = CASE 
    WHEN MOD(post_id, 2) = 1 THEN 'offering' 
    ELSE 'seeking' 
END; 