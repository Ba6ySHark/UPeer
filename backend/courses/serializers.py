from rest_framework import serializers

class CourseSerializer(serializers.Serializer):
    course_id = serializers.IntegerField(read_only=True)
    course_name = serializers.CharField(max_length=100)

class CourseCreateSerializer(serializers.Serializer):
    course_name = serializers.CharField(max_length=100)

class CourseEnrollSerializer(serializers.Serializer):
    course_id = serializers.IntegerField() 