from django.urls import path

from .views import run_query
from .views import post_video_frame
from .views import create_video
from .views import generate_video
from .views import generate_short_link

urlpatterns = [
    path("query/", run_query, name="run_query"),
    path("video/create/", create_video, name="create_video"),
    path("video/<int:id>/frame/", post_video_frame, name="post_video_frame"),
    path("video/<int:id>/generate/", generate_video, name="generate_video"),
    path("shortlink/generate/", generate_short_link, name="generate_short_link"),
]
