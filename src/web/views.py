from django.shortcuts import render
from django.views.decorators.http import require_safe

from query.sparql import df_from_query
from graphs.bar_chart_race import tidy_data

@require_safe
def render_react_index(request):
    return render(request, "index.html", {})

@require_safe
def bar_race(request):
    query = """SELECT ?item ?itemLabel ?population ?date WHERE {
  ?uf wdt:P31 wd:Q485258; wdt:P36 ?item. # get Brazilian states capitals
  ?item p:P1082 ?population_node.
  ?population_node ps:P1082 ?population.
  ?population_node pq:P585 ?date.
  # ?item wdt:P1082
  SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],mul,en". }
}"""
    df = df_from_query(query)
    bar_race_data = tidy_data(df)
    data = {
        "bar_race_data": bar_race_data,
    }
    return render(request, "bar_race.html", data)

