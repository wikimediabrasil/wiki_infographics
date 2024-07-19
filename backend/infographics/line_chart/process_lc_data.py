from infographics.convert_dtypes import convert_dtypes

def process_lc_data(data):
    """
    Process data for line chart visualization.
    
    :param data: DataFrame containing the processed data
    :return: Processed data suitable for line chart
    """
    
    return data.to_dict(orient='records')
