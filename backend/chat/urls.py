from django.urls import path
from .views import ChatMessageListView

urlpatterns = [
    path('<int:group_id>/messages/', ChatMessageListView.as_view(), name='chat-messages'),
] 