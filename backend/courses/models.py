from django.db import models
from django.db import connection

class CourseManager:
    @staticmethod
    def get_all_courses():
        with connection.cursor() as cursor:
            query = "SELECT course_id, course_name FROM courses ORDER BY course_name"
            cursor.execute(query)
            courses = []
            for row in cursor.fetchall():
                courses.append({
                    'course_id': row[0],
                    'course_name': row[1]
                })
            return courses
    
    @staticmethod
    def get_course_by_id(course_id):
        with connection.cursor() as cursor:
            query = "SELECT course_id, course_name FROM courses WHERE course_id = %s"
            cursor.execute(query, [course_id])
            row = cursor.fetchone()
            if row:
                return {
                    'course_id': row[0],
                    'course_name': row[1]
                }
            return None
    
    @staticmethod
    def create_course(course_name):
        with connection.cursor() as cursor:
            query = "INSERT INTO courses (course_name) VALUES (%s)"
            cursor.execute(query, [course_name])
            return cursor.lastrowid
    
    @staticmethod
    def enroll_user(user_id, course_id):
        with connection.cursor() as cursor:
            query = "INSERT INTO user_courses (user_id, course_id) VALUES (%s, %s)"
            try:
                cursor.execute(query, [user_id, course_id])
                return True
            except:
                return False
    
    @staticmethod
    def unenroll_user(user_id, course_id):
        with connection.cursor() as cursor:
            query = "DELETE FROM user_courses WHERE user_id = %s AND course_id = %s"
            cursor.execute(query, [user_id, course_id])
            return cursor.rowcount > 0
    
    @staticmethod
    def get_user_courses(user_id):
        with connection.cursor() as cursor:
            query = """
                SELECT c.course_id, c.course_name 
                FROM courses c 
                JOIN user_courses uc ON c.course_id = uc.course_id 
                WHERE uc.user_id = %s
            """
            cursor.execute(query, [user_id])
            courses = []
            for row in cursor.fetchall():
                courses.append({
                    'course_id': row[0],
                    'course_name': row[1]
                })
            return courses
