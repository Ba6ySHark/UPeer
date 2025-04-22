from django.shortcuts import render
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from authentication.permissions import IsAuthenticated, IsAdmin
from .serializers import MessageSerializer
from .models import MessageManager
from groups.models import GroupManager

# Create your views here.

class ChatMessageListView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, group_id):
        # Verify group exists
        group = GroupManager.get_group_by_id(group_id)
        if not group:
            return Response({'error': 'Group not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Verify user is a member of the group
        if not GroupManager.is_member(group_id, request.user.user_id):
            return Response({'error': 'You are not a member of this group'}, status=status.HTTP_403_FORBIDDEN)
        
        messages = MessageManager.get_group_messages(group_id)
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
