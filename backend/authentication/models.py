from django.db import models
from django.db import connection
import hashlib

# Create your models here.

class UserManager:
    @staticmethod
    def create_user(name, email, password, is_admin=0):
        with connection.cursor() as cursor:
            # Hash the password with SHA2
            hashed_password = hashlib.sha256(password.encode()).hexdigest()
            query = "INSERT INTO users (name, email, password, is_admin) VALUES (%s, %s, %s, %s)"
            cursor.execute(query, [name, email, hashed_password, is_admin])
            return cursor.lastrowid
    
    @staticmethod
    def get_user_by_email(email):
        with connection.cursor() as cursor:
            query = "SELECT user_id, name, email, password, is_admin, created_at FROM users WHERE email = %s"
            cursor.execute(query, [email])
            row = cursor.fetchone()
            if row:
                return {
                    'user_id': row[0],
                    'name': row[1],
                    'email': row[2],
                    'password': row[3],
                    'is_admin': bool(row[4]),
                    'created_at': row[5]
                }
            return None
    
    @staticmethod
    def get_user_by_id(user_id):
        with connection.cursor() as cursor:
            query = "SELECT user_id, name, email, is_admin, created_at FROM users WHERE user_id = %s"
            cursor.execute(query, [user_id])
            row = cursor.fetchone()
            if row:
                return {
                    'user_id': row[0],
                    'name': row[1],
                    'email': row[2],
                    'is_admin': bool(row[3]),
                    'created_at': row[4]
                }
            return None
    
    @staticmethod
    def update_user(user_id, name, email):
        with connection.cursor() as cursor:
            query = "UPDATE users SET name = %s, email = %s WHERE user_id = %s"
            cursor.execute(query, [name, email, user_id])
            return cursor.rowcount > 0
    
    @staticmethod
    def delete_user(user_id):
        with connection.cursor() as cursor:
            query = "DELETE FROM users WHERE user_id = %s"
            cursor.execute(query, [user_id])
            return cursor.rowcount > 0
