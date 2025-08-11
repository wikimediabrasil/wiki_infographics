from django.db import models


class Video(models.Model):
    created = models.DateTimeField(auto_now_add=True)
    modified = models.DateTimeField(auto_now=True)


class VideoFrame(models.Model):
    created = models.DateTimeField(auto_now_add=True)
    modified = models.DateTimeField(auto_now=True)

    video = models.ForeignKey(Video, on_delete=models.CASCADE, related_name="frames")
    index = models.PositiveIntegerField()
    svg_content = models.TextField(blank=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=("video", "index"), name="video_and_index_unique"),
        ]
