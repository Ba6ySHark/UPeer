from django.urls import path
from .views import PostListView, PostDetailView, PostReportView, ReportedPostListView

urlpatterns = [
    path('', PostListView.as_view(), name='post-list'),
    path('<int:post_id>/', PostDetailView.as_view(), name='post-detail'),
    path('<int:post_id>/report/', PostReportView.as_view(), name='post-report'),
    path('reported/', ReportedPostListView.as_view(), name='reported-post-list'),
] 