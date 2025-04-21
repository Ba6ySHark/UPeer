from django.shortcuts import render
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from .serializers import UserRegistrationSerializer, UserLoginSerializer, UserProfileSerializer, UserUpdateSerializer
from .models import UserManager
import hashlib
import jwt
import datetime
from django.conf import settings

# Create your views here.

class RegisterView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            # Check if user already exists
            existing_user = UserManager.get_user_by_email(serializer.validated_data['email'])
            if existing_user:
                return Response({'error': 'User with this email already exists'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Create user
            user_id = UserManager.create_user(
                name=serializer.validated_data['name'],
                email=serializer.validated_data['email'],
                password=serializer.validated_data['password'],
                is_admin=serializer.validated_data.get('is_admin', False)
            )
            
            # Get the created user
            user = UserManager.get_user_by_id(user_id)
            
            # Generate JWT token
            token = jwt.encode({
                'user_id': user_id,
                'email': serializer.validated_data['email'],
                'is_admin': user['is_admin'],
                'exp': datetime.datetime.utcnow() + datetime.timedelta(days=1)
            }, settings.SECRET_KEY, algorithm='HS256')
            
            return Response({
                'user': {
                    'user_id': user['user_id'], 
                    'name': user['name'], 
                    'email': user['email'], 
                    'is_admin': user['is_admin']
                },
                'token': token
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid():
            user = UserManager.get_user_by_email(serializer.validated_data['email'])
            if not user:
                return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
            
            # Verify password
            hashed_password = hashlib.sha256(serializer.validated_data['password'].encode()).hexdigest()
            if user['password'] != hashed_password:
                return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
            
            # Generate JWT token
            token = jwt.encode({
                'user_id': user['user_id'],
                'email': user['email'],
                'is_admin': user['is_admin'],
                'exp': datetime.datetime.utcnow() + datetime.timedelta(days=1)
            }, settings.SECRET_KEY, algorithm='HS256')
            
            return Response({
                'user': {
                    'user_id': user['user_id'], 
                    'name': user['name'], 
                    'email': user['email'], 
                    'is_admin': user['is_admin']
                },
                'token': token
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ProfileView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = UserManager.get_user_by_id(request.user['user_id'])
        if not user:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = UserProfileSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def put(self, request):
        serializer = UserUpdateSerializer(data=request.data)
        if serializer.is_valid():
            success = UserManager.update_user(
                user_id=request.user['user_id'],
                name=serializer.validated_data['name'],
                email=serializer.validated_data['email']
            )
            
            if not success:
                return Response({'error': 'Failed to update user'}, status=status.HTTP_400_BAD_REQUEST)
            
            user = UserManager.get_user_by_id(request.user['user_id'])
            return Response(UserProfileSerializer(user).data, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
