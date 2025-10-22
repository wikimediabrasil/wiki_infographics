from django.urls import path

from .views import redirect_to_query

urlpatterns = [
    path("<str:encoded_id>/", redirect_to_query, name="shortlink"),
]
