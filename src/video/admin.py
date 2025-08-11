from django.contrib import admin

from video.models import Video
from video.models import VideoFrame

@admin.register(Video)
class VideoAdmin(admin.ModelAdmin):
    list_display = ["id", "created", "modified"]

@admin.register(VideoFrame)
class VideoFrameAdmin(admin.ModelAdmin):
    list_display = ["video", "index", "created"]
    raw_id_fields = ["video"]
