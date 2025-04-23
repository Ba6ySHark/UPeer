from django.shortcuts import render
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from authentication.permissions import IsAuthenticated, IsAdmin
from .serializers import CourseSerializer, CourseCreateSerializer, CourseEnrollSerializer
from .models import CourseManager

# Create your views here.

class CourseListView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        courses = CourseManager.get_all_courses()
        serializer = CourseSerializer(courses, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def post(self, request):
        # Only admin users can create courses
        if not request.user.is_admin:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
            
        serializer = CourseCreateSerializer(data=request.data)
        if serializer.is_valid():
            course_id = CourseManager.create_course(
                serializer.validated_data['course_name'],
                serializer.validated_data.get('description', None)
            )
            course = CourseManager.get_course_by_id(course_id)
            return Response(CourseSerializer(course).data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserCourseListView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        courses = CourseManager.get_user_courses(request.user.user_id)
        serializer = CourseSerializer(courses, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class CourseEnrollView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = CourseEnrollSerializer(data=request.data)
        if serializer.is_valid():
            # Verify course exists
            course = CourseManager.get_course_by_id(serializer.validated_data['course_id'])
            if not course:
                return Response({'error': 'Course not found'}, status=status.HTTP_404_NOT_FOUND)
            
            success = CourseManager.enroll_user(
                user_id=request.user.user_id,
                course_id=serializer.validated_data['course_id']
            )
            
            if not success:
                return Response({'error': 'Failed to enroll in course'}, status=status.HTTP_400_BAD_REQUEST)
            
            return Response({'message': 'Successfully enrolled in course'}, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CourseUnenrollView(APIView):
    permission_classes = [IsAuthenticated]
    
    def delete(self, request, course_id):
        # Verify course exists
        course = CourseManager.get_course_by_id(course_id)
        if not course:
            return Response({'error': 'Course not found'}, status=status.HTTP_404_NOT_FOUND)
        
        success = CourseManager.unenroll_user(
            user_id=request.user.user_id,
            course_id=course_id
        )
        
        if not success:
            return Response({'error': 'Failed to unenroll from course'}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({'message': 'Successfully unenrolled from course'}, status=status.HTTP_200_OK)
