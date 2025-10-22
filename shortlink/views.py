from django.shortcuts import redirect
from django.shortcuts import reverse
from django.http import HttpResponse
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.views.decorators.http import require_safe
from django.views.decorators.csrf import csrf_exempt

from shortlink.models import ShortLink

@require_safe
def redirect_to_query(request, encoded_id: str):
    try:
        query = ShortLink.objects.query_from_encoded_id(encoded_id)
    except (ShortLink.DoesNotExist, IndexError):
        return HttpResponse(status=404)
    url = reverse("main")
    return redirect(url + f"?query={query}")


@csrf_exempt
@require_POST
def get_short_link(request):
    query = request.POST["query"]
    encoded = ShortLink.objects.encoded_id_from_query(query)
    url = reverse("shortlink", kwargs={"encoded_id": encoded})
    return JsonResponse({"url": url}, status=201)
