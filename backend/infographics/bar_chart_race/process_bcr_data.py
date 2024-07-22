from infographics.convert_dtypes import convert_dtypes

def process_bcr_data(data):
    """
    Process data for bar chart race visualization.
    
    :param data: DataFrame containing the processed data
    :return: Processed data suitable for bar chart race
    """
   
    return data.to_dict(orient='records')
