from django.urls import path

from .views import redirect_to_query
from .views import get_short_link

urlpatterns = [
    path("generate/", get_short_link, name="get_short_link"),
    path("<str:encoded_id>/", redirect_to_query, name="shortlink"),
]
