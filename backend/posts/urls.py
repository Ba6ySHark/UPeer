from django.urls import path
from .views import (
    PostListView, 
    PostDetailView, 
    PostReportView, 
    ReportedPostListView, 
    CommentListView, 
    CommentDetailView, 
    join_group_from_post,
    debug_post_groups
)

urlpatterns = [
    path('', PostListView.as_view(), name='post-list'),
    path('<int:post_id>/', PostDetailView.as_view(), name='post-detail'),
    path('<int:post_id>/report/', PostReportView.as_view(), name='post-report'),
    path('reported/', ReportedPostListView.as_view(), name='reported-posts'),
    
    # Comment endpoints
    path('<int:post_id>/comments/', CommentListView.as_view(), name='comment-list'),
    path('comments/<int:comment_id>/', CommentDetailView.as_view(), name='comment-detail'),
    
    # Group endpoints
    path('<int:post_id>/join-group/', join_group_from_post, name='join-group-from-post'),
    
    # Debug endpoints
    path('debug/groups/', debug_post_groups, name='debug-post-groups'),
] 