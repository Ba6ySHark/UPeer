#!/usr/bin/env python
import os
import mysql.connector
import hashlib

# Database credentials - match docker-compose.yml
DB_NAME = "myproject"
DB_USER = "root"
DB_PASS = "root"
DB_HOST = "localhost"
DB_PORT = "3307"  # Docker mapped port

def check_users():
    try:
        # Connect to the database
        print(f"Connecting to MySQL: {DB_HOST}:{DB_PORT} - {DB_USER}/{DB_NAME}")
        conn = mysql.connector.connect(
            host=DB_HOST,
            port=DB_PORT,
            user=DB_USER,
            password=DB_PASS,
            database=DB_NAME
        )
        cursor = conn.cursor(dictionary=True)
        
        # Check if the users table exists
        cursor.execute("SHOW TABLES LIKE 'users'")
        if not cursor.fetchone():
            print("Error: 'users' table does not exist!")
            return
        
        # Check user count
        cursor.execute("SELECT COUNT(*) as count FROM users")
        count = cursor.fetchone()["count"]
        print(f"Found {count} users in the database")
        
        # List all users
        cursor.execute("SELECT user_id, name, email, password, is_admin FROM users")
        users = cursor.fetchall()
        
        for user in users:
            print(f"\nUser ID: {user['user_id']}")
            print(f"Name: {user['name']}")
            print(f"Email: {user['email']}")
            print(f"Is Admin: {user['is_admin']}")
            print(f"Password Hash: {user['password'][:10]}...")
            
            # Check if password matches 'password123'
            test_password = "password123"
            hashed = hashlib.sha256(test_password.encode()).hexdigest()
            matches = hashed == user["password"]
            print(f"Password 'password123' matches: {matches}")
            
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_users() 