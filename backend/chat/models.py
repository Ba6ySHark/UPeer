from django.db import models
from django.db import connection

# Create your models here.

class MessageManager:
    @staticmethod
    def create_message(group_id, user_id, content):
        with connection.cursor() as cursor:
            query = "INSERT INTO messages (group_id, user_id, content) VALUES (%s, %s, %s)"
            cursor.execute(query, [group_id, user_id, content])
            return cursor.lastrowid
    
    @staticmethod
    def get_message_by_id(message_id):
        with connection.cursor() as cursor:
            query = """
                SELECT m.message_id, m.group_id, m.user_id, m.content, m.timestamp, u.name AS sender
                FROM messages m
                JOIN users u ON m.user_id = u.user_id
                WHERE m.message_id = %s
            """
            cursor.execute(query, [message_id])
            row = cursor.fetchone()
            if row:
                return {
                    'message_id': row[0],
                    'group_id': row[1],
                    'user_id': row[2],
                    'content': row[3],
                    'timestamp': row[4],
                    'sender': row[5]
                }
            return None
    
    @staticmethod
    def get_group_messages(group_id):
        with connection.cursor() as cursor:
            query = """
                SELECT m.message_id, m.content, m.timestamp, u.name AS sender
                FROM messages m
                JOIN users u ON m.user_id = u.user_id
                WHERE m.group_id = %s
                ORDER BY m.timestamp ASC
            """
            cursor.execute(query, [group_id])
            messages = []
            for row in cursor.fetchall():
                messages.append({
                    'message_id': row[0],
                    'content': row[1],
                    'timestamp': row[2],
                    'sender': row[3]
                })
            return messages
