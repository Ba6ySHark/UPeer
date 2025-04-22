from django.db import models
from django.db import connection

class PostManager:
    @staticmethod
    def get_posts(course_id=None):
        with connection.cursor() as cursor:
            query = """
                SELECT p.post_id, p.content, p.date_created, u.name AS author, c.course_name 
                FROM posts p 
                JOIN users u ON p.user_id = u.user_id 
                LEFT JOIN courses c ON p.course_id = c.course_id 
                WHERE p.is_active = 1 AND (%s IS NULL OR p.course_id = %s) 
                ORDER BY p.date_created DESC
            """
            cursor.execute(query, [course_id, course_id])
            posts = []
            for row in cursor.fetchall():
                posts.append({
                    'post_id': row[0],
                    'content': row[1],
                    'date_created': row[2],
                    'author': row[3],
                    'course_name': row[4]
                })
            return posts
    
    @staticmethod
    def get_post_by_id(post_id):
        with connection.cursor() as cursor:
            query = """
                SELECT p.post_id, p.content, p.date_created, p.date_modified, p.user_id, p.course_id, p.is_active, p.is_reported 
                FROM posts p 
                WHERE p.post_id = %s
            """
            cursor.execute(query, [post_id])
            row = cursor.fetchone()
            if row:
                return {
                    'post_id': row[0],
                    'content': row[1],
                    'date_created': row[2],
                    'date_modified': row[3],
                    'user_id': row[4],
                    'course_id': row[5],
                    'is_active': bool(row[6]),
                    'is_reported': bool(row[7])
                }
            return None
    
    @staticmethod
    def create_post(user_id, content, course_id=None):
        with connection.cursor() as cursor:
            query = "INSERT INTO posts (user_id, course_id, content) VALUES (%s, %s, %s)"
            cursor.execute(query, [user_id, course_id, content])
            return cursor.lastrowid
    
    @staticmethod
    def update_post(post_id, user_id, content, is_admin=False):
        with connection.cursor() as cursor:
            # Only the post owner or an admin can update a post
            query = """
                UPDATE posts 
                SET content = %s, date_modified = CURRENT_TIMESTAMP 
                WHERE post_id = %s AND (user_id = %s OR %s)
            """
            cursor.execute(query, [content, post_id, user_id, is_admin])
            return cursor.rowcount > 0
    
    @staticmethod
    def delete_post(post_id, user_id, is_admin=False):
        with connection.cursor() as cursor:
            # Only the post owner or an admin can delete a post
            query = "DELETE FROM posts WHERE post_id = %s AND (user_id = %s OR %s)"
            cursor.execute(query, [post_id, user_id, is_admin])
            return cursor.rowcount > 0
    
    @staticmethod
    def report_post(post_id):
        with connection.cursor() as cursor:
            query = "UPDATE posts SET is_reported = 1 WHERE post_id = %s"
            cursor.execute(query, [post_id])
            return cursor.rowcount > 0
    
    @staticmethod
    def get_reported_posts():
        with connection.cursor() as cursor:
            query = """
                SELECT p.post_id, p.content, p.user_id, u.name AS author 
                FROM posts p 
                JOIN users u ON p.user_id = u.user_id 
                WHERE p.is_reported = 1 
                ORDER BY p.date_created DESC
            """
            cursor.execute(query)
            posts = []
            for row in cursor.fetchall():
                posts.append({
                    'post_id': row[0],
                    'content': row[1],
                    'user_id': row[2],
                    'author': row[3]
                })
            return posts
