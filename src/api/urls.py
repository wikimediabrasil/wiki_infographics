from django.urls import path

from .views import run_query

urlpatterns = [
    path("", run_query, name="run_query"),
]
