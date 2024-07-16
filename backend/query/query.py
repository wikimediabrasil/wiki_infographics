import requests
import pandas as pd

def query(sparql_string):
    """
    Query the Wikidata SPARQL endpoint and return the results as a DataFrame.
    
    :param sparql_string: SPARQL query string
    :return: DataFrame containing the results
    """
    url = "https://query.wikidata.org/sparql"
    params = {
        "query": sparql_string,
        "format": "json"
    }
    headers = {'User-agent': 'Wiki-Infographics 1.0'}
    response = requests.get(url, headers=headers, params=params)

    if response.status_code != 200:
        raise Exception("Query failed with status code {}".format(response.status_code))

    data = response.json()
    results = data['results']['bindings']
    variables = data['head']['vars']
    
    # Convert results to DataFrame
    df = pd.DataFrame([{var: binding.get(var, {}).get('value', None) for var in variables} for binding in results])
    
    return df
