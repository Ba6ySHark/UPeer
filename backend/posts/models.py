from django.db import models
from django.db import connection
from django.db.utils import DatabaseError

class PostManager:
    @staticmethod
    def get_posts(course_id=None, post_type=None):
        try:
            with connection.cursor() as cursor:
                params = []
                conditions = ["p.is_active = 1"]
                
                if course_id is not None:
                    conditions.append("p.course_id = %s")
                    params.append(course_id)
                    
                if post_type is not None:
                    conditions.append("p.post_type = %s")
                    params.append(post_type)
                    
                where_clause = " AND ".join(conditions)
                
                query = f"""
                    SELECT p.post_id, p.content, p.date_created, p.post_type, u.name AS author, c.course_name 
                    FROM posts p 
                    JOIN users u ON p.user_id = u.user_id 
                    LEFT JOIN courses c ON p.course_id = c.course_id 
                    WHERE {where_clause}
                    ORDER BY p.date_created DESC
                """
                cursor.execute(query, params)
                posts = []
                for row in cursor.fetchall():
                    posts.append({
                        'post_id': row[0],
                        'content': row[1],
                        'date_created': row[2],
                        'post_type': row[3],
                        'author': row[4],
                        'course_name': row[5]
                    })
                return posts
        except DatabaseError as e:
            # If there's an error related to the post_type column
            if "Unknown column 'p.post_type'" in str(e):
                # Fallback query without post_type
                with connection.cursor() as cursor:
                    params = []
                    conditions = ["p.is_active = 1"]
                    
                    if course_id is not None:
                        conditions.append("p.course_id = %s")
                        params.append(course_id)
                        
                    where_clause = " AND ".join(conditions)
                    
                    # Use a default value for post_type since it doesn't exist
                    query = f"""
                        SELECT p.post_id, p.content, p.date_created, 'seeking' AS post_type, u.name AS author, c.course_name 
                        FROM posts p 
                        JOIN users u ON p.user_id = u.user_id 
                        LEFT JOIN courses c ON p.course_id = c.course_id 
                        WHERE {where_clause}
                        ORDER BY p.date_created DESC
                    """
                    cursor.execute(query, params)
                    posts = []
                    for row in cursor.fetchall():
                        posts.append({
                            'post_id': row[0],
                            'content': row[1],
                            'date_created': row[2],
                            'post_type': row[3],
                            'author': row[4],
                            'course_name': row[5]
                        })
                    return posts
            else:
                # For other database errors, re-raise
                raise
    
    @staticmethod
    def get_post_by_id(post_id):
        with connection.cursor() as cursor:
            query = """
                SELECT p.post_id, p.content, p.date_created, p.date_modified, p.user_id, p.course_id, 
                       p.post_type, p.is_active, p.is_reported 
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
                    'post_type': row[6],
                    'is_active': bool(row[7]),
                    'is_reported': bool(row[8])
                }
            return None
    
    @staticmethod
    def get_post_group(post_id):
        with connection.cursor() as cursor:
            query = """
                SELECT g.group_id, g.title 
                FROM post_group_associations pga
                JOIN study_groups g ON pga.group_id = g.group_id
                WHERE pga.post_id = %s
            """
            cursor.execute(query, [post_id])
            row = cursor.fetchone()
            if row:
                return {
                    'group_id': row[0],
                    'title': row[1]
                }
            return None
    
    @staticmethod
    def get_posts_with_groups():
        """Get all posts that have associated study groups for debugging purposes"""
        with connection.cursor() as cursor:
            query = """
                SELECT p.post_id, p.content, p.user_id, u.name as author, c.course_name,
                       g.group_id, g.title as group_title
                FROM posts p
                JOIN users u ON p.user_id = u.user_id
                LEFT JOIN courses c ON p.course_id = c.course_id
                JOIN post_group_associations pga ON p.post_id = pga.post_id
                JOIN study_groups g ON pga.group_id = g.group_id
                WHERE p.is_active = 1
                ORDER BY p.date_created DESC
            """
            cursor.execute(query)
            posts = []
            for row in cursor.fetchall():
                posts.append({
                    'post_id': row[0],
                    'content': row[1],
                    'user_id': row[2],
                    'author': row[3],
                    'course_name': row[4],
                    'group_id': row[5],
                    'group_title': row[6]
                })
            return posts
    
    @staticmethod
    def associate_group_with_post(post_id, group_id):
        with connection.cursor() as cursor:
            # First check if association already exists
            check_query = "SELECT 1 FROM post_group_associations WHERE post_id = %s"
            cursor.execute(check_query, [post_id])
            if cursor.fetchone():
                return False  # Association already exists
                
            # Create the association
            query = "INSERT INTO post_group_associations (post_id, group_id) VALUES (%s, %s)"
            cursor.execute(query, [post_id, group_id])
            return cursor.rowcount > 0
    
    @staticmethod
    def create_post(user_id, content, course_id=None, post_type='seeking'):
        try:
            with connection.cursor() as cursor:
                query = "INSERT INTO posts (user_id, course_id, content, post_type) VALUES (%s, %s, %s, %s)"
                cursor.execute(query, [user_id, course_id, content, post_type])
                return cursor.lastrowid
        except DatabaseError as e:
            # If there's an error related to the post_type column
            if "Unknown column 'post_type'" in str(e):
                # Fallback: insert without post_type
                with connection.cursor() as cursor:
                    query = "INSERT INTO posts (user_id, course_id, content) VALUES (%s, %s, %s)"
                    cursor.execute(query, [user_id, course_id, content])
                    return cursor.lastrowid
            else:
                # For other database errors, re-raise
                raise
    
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
    def report_post(post_id, user_id, reason):
        with connection.cursor() as cursor:
            # Check if post exists
            check_query = "SELECT post_id FROM posts WHERE post_id = %s"
            cursor.execute(check_query, [post_id])
            if not cursor.fetchone():
                return False
                
            # Create report
            report_query = "INSERT INTO post_reports (post_id, user_id, reason) VALUES (%s, %s, %s)"
            cursor.execute(report_query, [post_id, user_id, reason])
            
            # Mark post as reported
            update_query = "UPDATE posts SET is_reported = 1 WHERE post_id = %s"
            cursor.execute(update_query, [post_id])
            
            return True
    
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
    
    @staticmethod
    def get_posts_for_enrolled_courses(user_id, post_type=None):
        """Get posts that are related to courses the user is enrolled in"""
        try:
            with connection.cursor() as cursor:
                params = [user_id]
                conditions = ["p.is_active = 1", "uc.user_id = %s"]
                
                if post_type is not None:
                    conditions.append("p.post_type = %s")
                    params.append(post_type)
                    
                where_clause = " AND ".join(conditions)
                
                query = f"""
                    SELECT p.post_id, p.content, p.date_created, p.post_type, u.name AS author, c.course_name 
                    FROM posts p 
                    JOIN users u ON p.user_id = u.user_id 
                    JOIN courses c ON p.course_id = c.course_id 
                    JOIN user_courses uc ON p.course_id = uc.course_id
                    WHERE {where_clause}
                    ORDER BY p.date_created DESC
                """
                cursor.execute(query, params)
                posts = []
                for row in cursor.fetchall():
                    posts.append({
                        'post_id': row[0],
                        'content': row[1],
                        'date_created': row[2],
                        'post_type': row[3],
                        'author': row[4],
                        'course_name': row[5]
                    })
                return posts
        except DatabaseError as e:
            # If there's an error related to the post_type column
            if "Unknown column 'p.post_type'" in str(e):
                # Fallback query without post_type
                with connection.cursor() as cursor:
                    params = [user_id]
                    conditions = ["p.is_active = 1", "uc.user_id = %s"]
                    
                    where_clause = " AND ".join(conditions)
                    
                    # Use a default value for post_type since it doesn't exist
                    query = f"""
                        SELECT p.post_id, p.content, p.date_created, 'seeking' AS post_type, u.name AS author, c.course_name 
                        FROM posts p 
                        JOIN users u ON p.user_id = u.user_id 
                        JOIN courses c ON p.course_id = c.course_id 
                        JOIN user_courses uc ON p.course_id = uc.course_id
                        WHERE {where_clause}
                        ORDER BY p.date_created DESC
                    """
                    cursor.execute(query, params)
                    posts = []
                    for row in cursor.fetchall():
                        posts.append({
                            'post_id': row[0],
                            'content': row[1],
                            'date_created': row[2],
                            'post_type': row[3],
                            'author': row[4],
                            'course_name': row[5]
                        })
                    return posts
            else:
                # For other database errors, re-raise
                raise

class CommentManager:
    @staticmethod
    def get_comments_for_post(post_id):
        with connection.cursor() as cursor:
            query = """
                SELECT c.comment_id, c.content, c.date_created, c.user_id, u.name AS author 
                FROM comments c 
                JOIN users u ON c.user_id = u.user_id 
                WHERE c.post_id = %s
                ORDER BY c.date_created DESC
            """
            cursor.execute(query, [post_id])
            comments = []
            for row in cursor.fetchall():
                comments.append({
                    'comment_id': row[0],
                    'content': row[1],
                    'date_created': row[2],
                    'user_id': row[3],
                    'author': row[4]
                })
            return comments
    
    @staticmethod
    def create_comment(post_id, user_id, content, parent_id=None):
        with connection.cursor() as cursor:
            # First check if post exists
            post_query = "SELECT post_id FROM posts WHERE post_id = %s"
            cursor.execute(post_query, [post_id])
            if not cursor.fetchone():
                return None
                
            # If parent_id is provided, check if it's a valid comment
            if parent_id:
                parent_query = "SELECT comment_id FROM comments WHERE comment_id = %s AND post_id = %s"
                cursor.execute(parent_query, [parent_id, post_id])
                if not cursor.fetchone():
                    return None
            
            # Insert comment
            query = "INSERT INTO comments (post_id, user_id, content, parent_id) VALUES (%s, %s, %s, %s)"
            cursor.execute(query, [post_id, user_id, content, parent_id])
            comment_id = cursor.lastrowid
            
            # Get the created comment
            get_query = """
                SELECT c.comment_id, c.content, c.date_created, c.user_id, u.name AS author 
                FROM comments c 
                JOIN users u ON c.user_id = u.user_id 
                WHERE c.comment_id = %s
            """
            cursor.execute(get_query, [comment_id])
            row = cursor.fetchone()
            if row:
                return {
                    'comment_id': row[0],
                    'content': row[1],
                    'date_created': row[2],
                    'user_id': row[3],
                    'author': row[4],
                    'post_id': post_id,
                    'parent_id': parent_id
                }
            return None
    
    @staticmethod
    def delete_comment(comment_id, user_id, is_admin=False):
        with connection.cursor() as cursor:
            # Only the comment owner or an admin can delete a comment
            query = "DELETE FROM comments WHERE comment_id = %s AND (user_id = %s OR %s)"
            cursor.execute(query, [comment_id, user_id, is_admin])
            return cursor.rowcount > 0
