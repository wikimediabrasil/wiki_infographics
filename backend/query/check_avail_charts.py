import pandas as pd
from infographics.bar_chart_race.process_bcr_data import process_bcr_data
from infographics.line_chart.process_lc_data import process_lc_data
from infographics.table.process_table import process_table

def check_avail_charts(data):
    """
    Determine the available chart types based on the processed data
    and generate the corresponding data for each chart type.
    
    :param data: DataFrame containing the processed data
    :return: Dictionary with chart types as keys and processed data as values
    """
    charts_data = {}

    charts_data["table"] = process_table(data)

    charts_data['bar_chart_race'] = process_bcr_data(data)
    
    charts_data['line_chart'] = process_lc_data(data)
    
    return charts_data
