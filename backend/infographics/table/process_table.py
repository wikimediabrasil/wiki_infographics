def process_table(data):
    """
    Process data for table visualization.
    
    :param data: DataFrame containing the processed data
    :return: A dictionary of list of "columns" of the data and the data
    """
    
    result = {}
    
    columns_list = data.columns.tolist()

    result["columns"] = columns_list
    result["data"] = data.to_dict(orient='records')

    return result