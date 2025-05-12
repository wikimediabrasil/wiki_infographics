import requests
import pandas as pd
import re


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
        error_response = extract_error_message(response.text)
        return {"error": error_response}

    data = response.json()
    results = data['results']['bindings']
    variables = data['head']['vars']

    # Convert results to DataFrame
    df = pd.DataFrame([{var: binding.get(var, {}).get('value', None) for var in variables} for binding in results])

    return df



def extract_error_message(error_str):
    """
    Extracts and formats the MalformedQueryException error message from a given error string.

    Args:
        error_str (str): The full error message string.

    Returns:
        str: Formatted error message in the form of "MalformedQueryException: [error details]."
    """
    
    pattern = r"MalformedQueryException: [^.]*\."
    match = re.search(pattern, error_str)
    
    if match:
        return match.group(0)
    else:
        return error_str
