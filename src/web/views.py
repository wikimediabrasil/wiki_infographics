from django.shortcuts import render
from django.views.decorators.http import require_safe


@require_safe
def render_react_index(request):
    return render(request, "index.html", {})
