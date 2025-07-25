from django.http import JsonResponse
from django.http import HttpResponse
from django.views.decorators.http import require_safe

from query.sparql import df_from_query
from graphs.utils import charts_from_df


@require_safe
def run_query(request):
    query = request.GET.get("query")
    if not query:
        return HttpResponse(status=400)

    df = df_from_query(query)

    if isinstance(df, dict) and "error" in df:
        return JsonResponse(df, status=500)

    charts_data = charts_from_df(df)

    return JsonResponse({"msg": "Successful", "data": charts_data})
