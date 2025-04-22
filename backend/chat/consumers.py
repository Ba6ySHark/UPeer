import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import MessageManager
from groups.models import GroupManager
from authentication.models import UserManager

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.group_id = self.scope['url_route']['kwargs']['group_id']
        self.room_group_name = f'chat_{self.group_id}'
        
        # Get user from JWT token
        self.user = self.scope.get('user', None)
        if not self.user:
            await self.close()
            return
        
        # Check if user is a member of the group
        is_member = await database_sync_to_async(GroupManager.is_member)(self.group_id, self.user['user_id'])
        if not is_member:
            await self.close()
            return
        
        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()
    
    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
    
    # Receive message from WebSocket
    async def receive(self, text_data):
        data = json.loads(text_data)
        message = data['message']
        
        # Save message to database
        message_id = await database_sync_to_async(MessageManager.create_message)(
            self.group_id, self.user['user_id'], message
        )
        
        # Get the saved message with sender info
        saved_message = await database_sync_to_async(MessageManager.get_message_by_id)(message_id)
        
        # Send message to room group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': saved_message['content'],
                'message_id': saved_message['message_id'],
                'timestamp': saved_message['timestamp'].isoformat(),
                'sender': saved_message['sender'],
                'user_id': saved_message['user_id']
            }
        )
    
    # Receive message from room group
    async def chat_message(self, event):
        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'message_id': event['message_id'],
            'content': event['message'],
            'timestamp': event['timestamp'],
            'sender': event['sender'],
            'user_id': event['user_id']
        })) 