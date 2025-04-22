from django.shortcuts import render
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from authentication.permissions import IsAuthenticated, IsAdmin
from .serializers import PostSerializer, PostCreateSerializer, PostUpdateSerializer, PostReportSerializer, ReportedPostSerializer, CommentSerializer, CommentCreateSerializer
from .models import PostManager, CommentManager
from courses.models import CourseManager
from groups.models import GroupManager

# Create your views here.

class PostListView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        course_id = request.query_params.get('course_id', None)
        posts = PostManager.get_posts(course_id)
        serializer = PostSerializer(posts, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def post(self, request):
        serializer = PostCreateSerializer(data=request.data)
        if serializer.is_valid():
            course_id = serializer.validated_data.get('course_id')
            
            # Verify course exists if specified
            if course_id is not None:
                course = CourseManager.get_course_by_id(course_id)
                if not course:
                    return Response({'error': 'Course not found'}, status=status.HTTP_404_NOT_FOUND)
            
            post_id = PostManager.create_post(
                user_id=request.user.user_id,
                content=serializer.validated_data['content'],
                course_id=course_id
            )
            
            # Get the created post with author info
            posts = PostManager.get_posts(None)
            post = next((p for p in posts if p['post_id'] == post_id), None)
            
            if post:
                return Response(PostSerializer(post).data, status=status.HTTP_201_CREATED)
            
            return Response({'error': 'Failed to retrieve created post'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PostDetailView(APIView):
    permission_classes = [IsAuthenticated]
    
    def put(self, request, post_id):
        # Verify post exists
        post = PostManager.get_post_by_id(post_id)
        if not post:
            return Response({'error': 'Post not found'}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = PostUpdateSerializer(data=request.data)
        if serializer.is_valid():
            success = PostManager.update_post(
                post_id=post_id,
                user_id=request.user.user_id,
                content=serializer.validated_data['content'],
                is_admin=request.user.is_admin
            )
            
            if not success:
                return Response({'error': 'Failed to update post or not authorized'}, status=status.HTTP_403_FORBIDDEN)
            
            # Get the updated post with author info
            posts = PostManager.get_posts(None)
            updated_post = next((p for p in posts if p['post_id'] == post_id), None)
            
            if updated_post:
                return Response(PostSerializer(updated_post).data, status=status.HTTP_200_OK)
            
            return Response({'error': 'Failed to retrieve updated post'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, post_id):
        # Verify post exists
        post = PostManager.get_post_by_id(post_id)
        if not post:
            return Response({'error': 'Post not found'}, status=status.HTTP_404_NOT_FOUND)
        
        success = PostManager.delete_post(
            post_id=post_id,
            user_id=request.user.user_id,
            is_admin=request.user.is_admin
        )
        
        if not success:
            return Response({'error': 'Failed to delete post or not authorized'}, status=status.HTTP_403_FORBIDDEN)
        
        return Response(status=status.HTTP_204_NO_CONTENT)

class PostReportView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, post_id):
        # Verify post exists
        post = PostManager.get_post_by_id(post_id)
        if not post:
            return Response({'error': 'Post not found'}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = PostReportSerializer(data=request.data)
        if serializer.is_valid():
            success = PostManager.report_post(
                post_id=post_id,
                user_id=request.user.user_id,
                reason=serializer.validated_data['reason']
            )
            
            if not success:
                return Response({'error': 'Failed to report post'}, status=status.HTTP_400_BAD_REQUEST)
            
            return Response({'message': 'Post reported successfully'}, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ReportedPostListView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # Only admin users can see reported posts
        if not request.user.is_admin:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        
        posts = PostManager.get_reported_posts()
        serializer = ReportedPostSerializer(posts, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class CommentListView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, post_id):
        # Verify post exists
        post = PostManager.get_post_by_id(post_id)
        if not post:
            return Response({'error': 'Post not found'}, status=status.HTTP_404_NOT_FOUND)
        
        comments = CommentManager.get_comments_for_post(post_id)
        serializer = CommentSerializer(comments, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def post(self, request, post_id):
        # Verify post exists
        post = PostManager.get_post_by_id(post_id)
        if not post:
            return Response({'error': 'Post not found'}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = CommentCreateSerializer(data=request.data)
        if serializer.is_valid():
            parent_id = serializer.validated_data.get('parent_id')
            
            comment = CommentManager.create_comment(
                post_id=post_id,
                user_id=request.user.user_id,
                content=serializer.validated_data['content'],
                parent_id=parent_id
            )
            
            if not comment:
                return Response({'error': 'Failed to create comment'}, status=status.HTTP_400_BAD_REQUEST)
            
            return Response(CommentSerializer(comment).data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CommentDetailView(APIView):
    permission_classes = [IsAuthenticated]
    
    def delete(self, request, comment_id):
        success = CommentManager.delete_comment(
            comment_id=comment_id,
            user_id=request.user.user_id,
            is_admin=request.user.is_admin
        )
        
        if not success:
            return Response({'error': 'Failed to delete comment or not authorized'}, status=status.HTTP_403_FORBIDDEN)
        
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def join_group_from_post(request, post_id):
    # Verify post exists
    post = PostManager.get_post_by_id(post_id)
    if not post:
        return Response({'error': 'Post not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Check if post already has a group
    existing_group = PostManager.get_post_group(post_id)
    if existing_group:
        # Post already has a group, join the existing group
        group_id = existing_group['group_id']
    else:
        # Post doesn't have a group yet, create a new one
        course_id = post.get('course_id')
        
        # Get course name if available for group title
        course_name = None
        if course_id:
            course = CourseManager.get_course_by_id(course_id)
            if course:
                course_name = course.get('course_name')
        
        # Create a title for the group
        if course_name:
            group_title = f"Study Group for {course_name}"
        else:
            group_title = "Study Group"
        
        # Create the group
        group_id = GroupManager.create_group(group_title)
        
        if not group_id:
            return Response({'error': 'Failed to create group'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
        # Associate the group with the post
        success = PostManager.associate_group_with_post(post_id, group_id)
        if not success:
            return Response({'error': 'Failed to associate group with post'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    # Add the original post creator to the group first (if not already a member)
    post_creator_id = post.get('user_id')
    if post_creator_id:
        # Check if creator is already in the group
        if not GroupManager.is_member(group_id, post_creator_id):
            # Add post creator to the group
            GroupManager.join_group(group_id, post_creator_id)
            print(f"Added post creator (user_id: {post_creator_id}) to group {group_id}")
    
    # Add the current user (who clicked join) to the group
    if not GroupManager.is_member(group_id, request.user.user_id):
        success = GroupManager.join_group(group_id, request.user.user_id)
        if not success:
            return Response({'error': 'Failed to join group'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Get updated group information
    group = GroupManager.get_group_by_id(group_id)
    
    return Response(group, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def debug_post_groups(request):
    """Debug endpoint to check post-group associations"""
    posts_with_groups = PostManager.get_posts_with_groups()
    
    return Response({
        'post_group_associations': posts_with_groups,
        'count': len(posts_with_groups)
    }, status=status.HTTP_200_OK)
