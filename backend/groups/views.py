from django.shortcuts import render
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from authentication.permissions import IsAuthenticated, IsAdmin
from .serializers import GroupSerializer, GroupCreateSerializer, GroupMemberSerializer, GroupJoinSerializer
from .models import GroupManager

# Create your views here.

class GroupListView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        groups = GroupManager.get_user_groups(request.user.user_id)
        serializer = GroupSerializer(groups, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def post(self, request):
        serializer = GroupCreateSerializer(data=request.data)
        if serializer.is_valid():
            group_id = GroupManager.create_group(serializer.validated_data['title'])
            
            # Join the creator to the group
            GroupManager.join_group(group_id, request.user.user_id)
            
            group = GroupManager.get_group_by_id(group_id)
            return Response(GroupSerializer(group).data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class GroupDetailView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, group_id):
        # Verify group exists
        group = GroupManager.get_group_by_id(group_id)
        if not group:
            return Response({'error': 'Group not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Verify user is a member
        if not GroupManager.is_member(group_id, request.user.user_id):
            return Response({'error': 'You are not a member of this group'}, status=status.HTTP_403_FORBIDDEN)
        
        members = GroupManager.get_group_members(group_id)
        return Response({
            'group': GroupSerializer(group).data,
            'members': GroupMemberSerializer(members, many=True).data
        }, status=status.HTTP_200_OK)

class GroupJoinView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = GroupJoinSerializer(data=request.data)
        if serializer.is_valid():
            group_id = serializer.validated_data['group_id']
            
            # Verify group exists
            group = GroupManager.get_group_by_id(group_id)
            if not group:
                return Response({'error': 'Group not found'}, status=status.HTTP_404_NOT_FOUND)
            
            # Check if already a member
            if GroupManager.is_member(group_id, request.user.user_id):
                return Response({'error': 'Already a member of this group'}, status=status.HTTP_400_BAD_REQUEST)
            
            success = GroupManager.join_group(group_id, request.user.user_id)
            if not success:
                return Response({'error': 'Failed to join group'}, status=status.HTTP_400_BAD_REQUEST)
            
            return Response({'message': 'Successfully joined group'}, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class GroupLeaveView(APIView):
    permission_classes = [IsAuthenticated]
    
    def delete(self, request, group_id):
        # Verify group exists
        group = GroupManager.get_group_by_id(group_id)
        if not group:
            return Response({'error': 'Group not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Verify user is a member
        if not GroupManager.is_member(group_id, request.user.user_id):
            return Response({'error': 'You are not a member of this group'}, status=status.HTTP_400_BAD_REQUEST)
        
        success = GroupManager.leave_group(group_id, request.user.user_id)
        if not success:
            return Response({'error': 'Failed to leave group'}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({'message': 'Successfully left group'}, status=status.HTTP_200_OK)
