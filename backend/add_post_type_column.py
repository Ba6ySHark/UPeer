#!/usr/bin/env python
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'upeer_project.settings')
django.setup()

from django.db import connection

def add_post_type_column():
    """Add post_type column to the posts table if it doesn't exist"""
    
    with connection.cursor() as cursor:
        # Check if column exists
        cursor.execute("""
            SELECT COUNT(*) 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = 'posts' 
            AND COLUMN_NAME = 'post_type'
        """)
        column_exists = cursor.fetchone()[0] > 0
        
        if not column_exists:
            print("Adding post_type column to posts table...")
            # Add the column
            cursor.execute("""
                ALTER TABLE posts 
                ADD COLUMN post_type ENUM('seeking', 'offering') 
                NOT NULL DEFAULT 'seeking'
            """)
            print("Column added successfully!")
        else:
            print("post_type column already exists.")

if __name__ == "__main__":
    add_post_type_column() 