from django.urls import path

from .views import run_query
from .views import post_video_frame
from .views import create_video

urlpatterns = [
    path("query/", run_query, name="run_query"),
    path("video/create/", create_video, name="create_video"),
    path("video/<int:id>/frame/", post_video_frame, name="post_video_frame"),
]
