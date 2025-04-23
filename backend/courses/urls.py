from django.urls import path
from .views import CourseListView, UserCourseListView, CourseEnrollView, CourseUnenrollView

urlpatterns = [
    path('', CourseListView.as_view(), name='course-list'),
    path('mine/', UserCourseListView.as_view(), name='user-course-list'),
    path('enrol/', CourseEnrollView.as_view(), name='course-enroll'),
    path('enrol/<int:course_id>/', CourseUnenrollView.as_view(), name='course-unenroll'),
] 