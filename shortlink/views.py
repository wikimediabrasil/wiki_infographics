from urllib.parse import quote
from django.shortcuts import redirect
from django.shortcuts import reverse
from django.http import HttpResponse
from django.views.decorators.http import require_safe

from shortlink.models import ShortLink

@require_safe
def redirect_to_query(request, encoded_id: str):
    try:
        query = ShortLink.objects.query_from_encoded_id(encoded_id)
    except (ShortLink.DoesNotExist, IndexError):
        return HttpResponse(status=404)
    url = reverse("main")
    return redirect(url + f"?query={quote(query)}")
