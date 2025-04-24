from django.db import models
from django.db import connection

class GroupManager:
    @staticmethod
    def create_group(title):
        with connection.cursor() as cursor:
            query = "INSERT INTO study_groups (title) VALUES (%s)"
            cursor.execute(query, [title])
            group_id = cursor.lastrowid
            return group_id
    
    @staticmethod
    def get_group_by_id(group_id):
        with connection.cursor() as cursor:
            query = "SELECT group_id, title, date_created FROM study_groups WHERE group_id = %s"
            cursor.execute(query, [group_id])
            row = cursor.fetchone()
            if row:
                return {
                    'group_id': row[0],
                    'title': row[1],
                    'date_created': row[2]
                }
            return None
    
    @staticmethod
    def join_group(group_id, user_id):
        with connection.cursor() as cursor:
            query = "INSERT INTO study_group_members (group_id, user_id) VALUES (%s, %s)"
            try:
                cursor.execute(query, [group_id, user_id])
                return True
            except:
                return False
    
    @staticmethod
    def leave_group(group_id, user_id):
        with connection.cursor() as cursor:
            query = "DELETE FROM study_group_members WHERE group_id = %s AND user_id = %s"
            cursor.execute(query, [group_id, user_id])
            return cursor.rowcount > 0
    
    @staticmethod
    def get_user_groups(user_id):
        with connection.cursor() as cursor:
            query = """
                SELECT sg.group_id, sg.title, sg.date_created
                FROM study_groups sg
                JOIN study_group_members sgm ON sg.group_id = sgm.group_id
                WHERE sgm.user_id = %s
            """
            cursor.execute(query, [user_id])
            groups = []
            for row in cursor.fetchall():
                groups.append({
                    'group_id': row[0],
                    'title': row[1],
                    'date_created': row[2]
                })
            return groups
    
    @staticmethod
    def get_group_members(group_id):
        with connection.cursor() as cursor:
            query = """
                SELECT u.user_id, u.name, sgm.joined_at
                FROM users u
                JOIN study_group_members sgm ON u.user_id = sgm.user_id
                WHERE sgm.group_id = %s
                ORDER BY sgm.joined_at
            """
            cursor.execute(query, [group_id])
            members = []
            for row in cursor.fetchall():
                members.append({
                    'user_id': row[0],
                    'name': row[1],
                    'joined_at': row[2]
                })
            return members
    
    @staticmethod
    def is_member(group_id, user_id):
        with connection.cursor() as cursor:
            query = "SELECT 1 FROM study_group_members WHERE group_id = %s AND user_id = %s"
            cursor.execute(query, [group_id, user_id])
            return cursor.fetchone() is not None

    @staticmethod
    def invite_by_email(group_id, email):
        if not email or not email.strip():
            return {'success': False, 'message': 'Email address is required'}
            
        with connection.cursor() as cursor:
            # First, check if the user with this email exists
            query = "SELECT user_id FROM users WHERE email = %s"
            cursor.execute(query, [email])
            user_row = cursor.fetchone()
            
            # For debugging
            print(f"Looking up user with email: {email}, found: {user_row is not None}")
            
            if not user_row:
                return {'success': False, 'message': 'User with this email not found'}
                
            user_id = user_row[0]
            
            # Check if user is already a member
            if GroupManager.is_member(group_id, user_id):
                return {'success': False, 'message': 'User is already a member of this group'}
            
            # Add user to the group
            success = GroupManager.join_group(group_id, user_id)
            
            if success:
                return {'success': True, 'user_id': user_id}
            else:
                return {'success': False, 'message': 'Failed to add user to group'}
