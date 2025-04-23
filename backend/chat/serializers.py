from rest_framework import serializers

class MessageSerializer(serializers.Serializer):
    message_id = serializers.IntegerField(read_only=True)
    content = serializers.CharField()
    timestamp = serializers.DateTimeField(read_only=True)
    sender = serializers.CharField(read_only=True)

class MessageCreateSerializer(serializers.Serializer):
    content = serializers.CharField() 