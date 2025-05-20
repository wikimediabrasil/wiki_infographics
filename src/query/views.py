from django.http import JsonResponse
from django.http import HttpResponse
from django.views.decorators.http import require_safe

from query.sparql import sparql_query
from query.check_avail_charts import check_avail_charts


@require_safe
def run_query(request):
    query = request.GET.get("query")
    if not query:
        return HttpResponse(status=400)

    data = sparql_query(query)

    if isinstance(data, dict) and "error" in data:
        return JsonResponse(data, status=500)

    charts_data = check_avail_charts(data)

    return JsonResponse({"msg": "Successful", "data": charts_data})
