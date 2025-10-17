import logging
from subprocess import CalledProcessError

from django.http import JsonResponse
from django.http import HttpResponse
from django.views.decorators.http import require_safe
from django.views.decorators.http import require_POST
from django.views.decorators.http import require_GET
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import get_object_or_404
from django.utils.datastructures import MultiValueDictKeyError

from api.sparql import df_from_query
from graphs.utils import charts_from_df
from video.models import Video
from video.models import VideoFrame

logger = logging.getLogger("infographics")


@require_safe
def run_query(request):
    query = request.GET.get("query")
    if not query:
        return HttpResponse(status=400)

    logger.debug(f"running query: {query.replace("\n", "\\n")}")
    df = df_from_query(query)

    if isinstance(df, dict) and "error" in df:
        return JsonResponse(df, status=500)
    logger.debug(f"obtained successful df: {df}")

    charts_data = charts_from_df(df)

    return JsonResponse({"msg": "Successful", "data": charts_data})


@csrf_exempt
@require_POST
def create_video(request):
    video = Video.objects.create()
    return JsonResponse({"id": video.id}, status=201)


@csrf_exempt
@require_POST
def post_video_frame(request, id):
    data = request.POST
    video = get_object_or_404(Video, id=id)
    try:
        ordering = data["ordering"]
        svg = data["svg"]
    except MultiValueDictKeyError:
        return JsonResponse({"msg": "missing parameters"}, status=400)
    try:
        VideoFrame.objects.create_from_svg(svg, video=video, ordering=ordering)
    except CalledProcessError:
        return JsonResponse({"msg": "failed to convert svg to png"}, status=400)
    return HttpResponse(status=201)


@csrf_exempt
@require_GET
def generate_video(request, id):
    data = request.GET
    try:
        framerate = int(data["framerate"])
    except MultiValueDictKeyError:
        return JsonResponse({"msg": "missing parameters"}, status=400)
    except (TypeError, ValueError):
        return JsonResponse({"msg": "invalid framerate"}, status=400)
    video = get_object_or_404(Video, id=id)
    video.generate_video(framerate)
    video_data = video.file.read()
    res = HttpResponse(video_data, content_type="video/webm")
    res["Content-Disposition"] = 'filename="video.webm"'
    res["Access-Control-Expose-Headers"] = "Content-Disposition" # needed for axios to see it
    return res
