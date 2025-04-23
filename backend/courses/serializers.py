from rest_framework import serializers

class CourseSerializer(serializers.Serializer):
    course_id = serializers.IntegerField(read_only=True)
    course_name = serializers.CharField(max_length=100)
    description = serializers.CharField(allow_null=True, required=False)

class CourseCreateSerializer(serializers.Serializer):
    course_name = serializers.CharField(max_length=100)
    description = serializers.CharField(allow_null=True, required=False)

class CourseEnrollSerializer(serializers.Serializer):
    course_id = serializers.IntegerField() 