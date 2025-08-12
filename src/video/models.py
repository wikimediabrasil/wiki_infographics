import os
import subprocess
import logging

from django.db import models

logger = logging.getLogger("django")


class Video(models.Model):
    created = models.DateTimeField(auto_now_add=True)
    modified = models.DateTimeField(auto_now=True)

    def generate_video(self):
        if self.get_frames().exists():
            tempdir = "/tmp/infographics"
            i = 0 
            for frame in self.get_frames():
                index = f"{i:06d}"
                svg_path = os.path.join(tempdir, f"{index}.svg")
                png_path = os.path.join(tempdir, f"{index}.png")
                if not os.path.exists(svg_path):
                    with open(svg_path, "w") as f:
                        f.write(frame.svg_content)
                if not os.path.exists(png_path):
                    subprocess.run(["magick", svg_path, png_path])
                    logger.info(f"[{self.id}] generated {png_path}")
                i += 1
            subprocess.run(
                [
                    "ffmpeg",
                    "-i",
                    "%06d.png",
                    "output.mp4",
                ]
            )
            logger.info(f"[{self.id}] generated output.mp4")

    def get_frames(self):
        return self.frames.order_by("index")


class VideoFrame(models.Model):
    created = models.DateTimeField(auto_now_add=True)
    modified = models.DateTimeField(auto_now=True)

    video = models.ForeignKey(Video, on_delete=models.CASCADE, related_name="frames")
    index = models.PositiveIntegerField()
    svg_content = models.TextField(blank=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=("video", "index"), name="video_and_index_unique"
            ),
        ]
