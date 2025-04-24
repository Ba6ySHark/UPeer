from rest_framework import serializers

class GroupSerializer(serializers.Serializer):
    group_id = serializers.IntegerField(read_only=True)
    title = serializers.CharField()
    date_created = serializers.DateTimeField(read_only=True)

class GroupCreateSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=150)

class GroupMemberSerializer(serializers.Serializer):
    user_id = serializers.IntegerField(read_only=True)
    name = serializers.CharField(read_only=True)
    joined_at = serializers.DateTimeField(read_only=True)

class GroupJoinSerializer(serializers.Serializer):
    group_id = serializers.IntegerField()

class GroupInviteSerializer(serializers.Serializer):
    email = serializers.EmailField() 