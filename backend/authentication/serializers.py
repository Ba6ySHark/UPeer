from rest_framework import serializers

class UserRegistrationSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=100)
    email = serializers.EmailField(max_length=100)
    password = serializers.CharField(max_length=255, write_only=True)
    is_admin = serializers.BooleanField(default=False)

class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField(max_length=100)
    password = serializers.CharField(max_length=255, write_only=True)

class UserProfileSerializer(serializers.Serializer):
    user_id = serializers.IntegerField(read_only=True)
    name = serializers.CharField(max_length=100)
    email = serializers.EmailField(max_length=100)
    is_admin = serializers.BooleanField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)

class UserUpdateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=100)
    email = serializers.EmailField(max_length=100) 