from graphs.bar_chart_race import process_bar_chart_race
from graphs.table import process_table


def charts_from_df(df):
    """
    Determine the available chart types based on the processed data
    and generate the corresponding data for each chart type.

    :param df: DataFrame containing the processed data
    :return: dictionary with chart types as keys and processed data as values
    """
    charts = {}
    charts["table"] = process_table(df)
    charts["bar_chart_race"] = process_bar_chart_race(df)
    return charts
