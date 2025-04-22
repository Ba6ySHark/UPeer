from django.urls import path
from .views import GroupListView, GroupDetailView, GroupJoinView, GroupLeaveView

urlpatterns = [
    path('', GroupListView.as_view(), name='group-list'),
    path('<int:group_id>/', GroupDetailView.as_view(), name='group-detail'),
    path('join/', GroupJoinView.as_view(), name='group-join'),
    path('<int:group_id>/leave/', GroupLeaveView.as_view(), name='group-leave'),
] 