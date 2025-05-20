from django.urls import path

from .views import render_react_index

urlpatterns = [
    path("", render_react_index),
    path("infographics/", render_react_index),
]
