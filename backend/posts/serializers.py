from rest_framework import serializers

class PostSerializer(serializers.Serializer):
    post_id = serializers.IntegerField(read_only=True)
    content = serializers.CharField()
    date_created = serializers.DateTimeField(read_only=True)
    author = serializers.CharField(read_only=True)
    course_name = serializers.CharField(read_only=True, allow_null=True)

class PostCreateSerializer(serializers.Serializer):
    content = serializers.CharField()
    course_id = serializers.IntegerField(allow_null=True, required=False)

class PostUpdateSerializer(serializers.Serializer):
    content = serializers.CharField()

class PostReportSerializer(serializers.Serializer):
    post_id = serializers.IntegerField()

class ReportedPostSerializer(serializers.Serializer):
    post_id = serializers.IntegerField(read_only=True)
    content = serializers.CharField(read_only=True)
    user_id = serializers.IntegerField(read_only=True)
    author = serializers.CharField(read_only=True) 