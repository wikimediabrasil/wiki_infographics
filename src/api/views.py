from django.http import JsonResponse
from django.http import HttpResponse
from django.views.decorators.http import require_safe
from django.views.decorators.http import require_POST
from django.shortcuts import get_object_or_404
from django.db.utils import IntegrityError

from api.sparql import df_from_query
from graphs.utils import charts_from_df
from video.models import Video
from video.models import VideoFrame


@require_safe
def run_query(request):
    query = request.GET.get("query")
    if not query:
        return HttpResponse(status=400)

    df = df_from_query(query)

    if isinstance(df, dict) and "error" in df:
        return JsonResponse(df, status=500)

    charts_data = charts_from_df(df)

    return JsonResponse({"msg": "Successful", "data": charts_data})


@require_POST
def create_video(request):
    video = Video.objects.create()
    return JsonResponse({"id": video.id}, status=201)


@require_POST
def post_video_frame(request, id):
    data = request.POST
    video = get_object_or_404(Video, id=id)
    index = data["index"]
    svg_content = data["svg"]
    try:
        VideoFrame.objects.create(video=video, index=index, svg_content=svg_content)
    except IntegrityError:
        return JsonResponse({"msg": "index already in use"}, status=400)
    return HttpResponse(status=201)
