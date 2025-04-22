from django.shortcuts import render
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from authentication.permissions import IsAuthenticated, IsAdmin
from .serializers import PostSerializer, PostCreateSerializer, PostUpdateSerializer, PostReportSerializer, ReportedPostSerializer
from .models import PostManager
from courses.models import CourseManager

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
