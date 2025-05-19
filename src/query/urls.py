from django.urls import path

from .views import run_query

urlpatterns = [
    path("get/", run_query, name="run_query"),
]
