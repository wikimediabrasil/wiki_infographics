from django.urls import path

from .views import render_react_index
from .views import bar_race

urlpatterns = [
    path("", render_react_index),
    path("infographics/", render_react_index),
    path("bar_race/", bar_race, name="bar_race"),
]
