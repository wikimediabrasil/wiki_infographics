import pandas as pd
import re

def process_bcr_data(data):
    """
    Process data for bar chart race visualization.

    :param data: DataFrame containing the processed data
    :return: Processed data suitable for bar chart race or error message
    """

    # RULES

    # 1. Check if the number of columns is between 3 and 6
    if not (3 <= data.shape[1] <= 6):
        return {"failed": "data failed bar chart race rule - number of columns must be between 3 and 6"}

    # 2. Check if the last column is a date column
    if not data.iloc[:, -1].apply(is_datetime_string).any():
        return {"failed": "data failed bar chart race rule - last column must be a date column"}

    # 3. Check if the second to last column is a number-string column
    if not data.iloc[:, -2].apply(lambda x: isinstance(x, str) and x.replace('.', '', 1).isdigit()).any():
        return {"failed": "data failed bar chart race rule - second to last column must be a quantity column"}

    # 4. Identify columns with word identifiers
    identifier_columns = identify_word_identifier_columns(data.iloc[:, :-2])

    new_columns = rename_columns(data.columns, identifier_columns)

    new_data = data.copy()
    new_data.columns = new_columns

    # Select the relevant columns to form the new DataFrame
    selected_columns = [col for col in new_columns if col in ["category", "name", "value", "date"]]
    processed_data = new_data[selected_columns]

    processed = fill_nans(processed_data)

    result =  processed.to_dict(orient='records')

    return result


def fill_nans(df, fill_NaN=True):
    """
    Fill NaNs in dataframe using time-based linear interpolation.

    Args:
      df (pd.DataFrame): A dataframe.
      fill_NaN (bool): Enable or disable filling NaNs with appropriate values.

    Returns:
      pd.DataFrame: A DataFrame containing the cleaned data.
    """

    # Make a deep copy of the DataFrame to avoid SettingWithCopyWarning
    df = df.copy()

    df['value'] = df['value'].astype(int)
    df['date'] = pd.to_datetime(df['date']).dt.year
    
    if "category" in df.columns:

        # Handle duplicates by aggregating values within the same year and name
        df_aggregated = df.groupby(["date", "name", "category"], as_index=False).agg({
            "value": "max",
            "date": "first"
        })

        # Convert the year back to the "YYYY-01-01" format
        df_aggregated['date'] = df_aggregated['date'].astype(str) + '-01-01'

        # Pivot the table using the original 'date' column
        df_pivoted = df_aggregated.pivot(index="date", columns=["name", "category"], values="value").reset_index()
    else:
        # Handle duplicates by aggregating values within the same year and name
        df_aggregated = df.groupby(["date", "name"], as_index=False).agg({
            "value": "max",
            "date": "first" 
        })

        # Convert the year back to the "YYYY-01-01" format
        df_aggregated['date'] = df_aggregated['date'].astype(str) + '-01-01'

        # Pivot the table using the original 'date' column
        df_pivoted = df_aggregated.pivot(index="date", columns="name", values="value").reset_index()
   
    if fill_NaN:
        
        # Fill NaNs before the first valid value in each column with zero
        for col in df_pivoted.columns:
            first_valid_index = df_pivoted[col].first_valid_index()
            if first_valid_index is not None:
                df_pivoted.loc[:first_valid_index, col] = df_pivoted.loc[:first_valid_index, col].fillna(0)
        
        # Check if NaN is the last value in a column(Edge case) and fill NaNs in each column
        projection_factor = 1.1

        for col in df_pivoted.columns:
            last_valid_index = df_pivoted[col].last_valid_index()
            
            # If there is a last valid index and the last value is NaN, project the value
            if last_valid_index is not None and pd.isna(df_pivoted[col].iloc[-1]):
                projected_value = df_pivoted[col].iloc[last_valid_index] * projection_factor
                df_pivoted.loc[df_pivoted.index[-1], col] = projected_value

        df_pivoted['date'] = pd.to_datetime(df_pivoted['date'], format='%Y-%m-%d')
        df_pivoted.set_index('date', inplace=True)  

        # Use time based linear interpolation to fill NaNs between known values
        df_pivoted = df_pivoted.interpolate(method='time', limit_direction='forward', axis=0).astype(int)

        # print(df_pivoted)
        df_pivoted = df_pivoted.reset_index()

        # Flatten the MultiIndex columns if necessary
        df_pivoted.columns = ['_'.join(col).strip() if isinstance(col, tuple) else col for col in df_pivoted.columns]

        if "category" in df.columns:

            df_unpivoted = df_pivoted.melt(id_vars=['date_'], var_name='category_name', value_name='value')

            # Split the concatenated column names back into 'category' and 'name'
            df_unpivoted[['category', 'name']] = df_unpivoted['category_name'].str.split('_', expand=True)
            df_unpivoted.drop(columns=['category_name'], inplace=True)

            df_unpivoted.reset_index(drop=True, inplace=True)

            # Rename columns to match the desired format
            df_unpivoted.rename(columns={'date_': 'date'}, inplace=True)

            # Ensure columns are in the desired order
            df_unpivoted = df_unpivoted[['category', 'name', 'value', 'date']]
        else:

            df_unpivoted = df_pivoted.melt(id_vars=['date'], var_name='name', value_name='value')

            df_unpivoted.reset_index(drop=True, inplace=True)

            # Ensure columns are in the desired order
            df_unpivoted = df_unpivoted[['name', 'value', 'date']]

        df_unpivoted[['date', 'value']] = df_unpivoted[['date', 'value']].astype(str)
        
        return df_unpivoted

    return df_pivoted

def identify_word_identifier_columns(data):
    """
    Identify columns with word identifiers.

    :param data: DataFrame excluding the last two columns
    :return: List of column indices that match the word identifier rule
    """
    def is_non_link_word(x):
        if isinstance(x, str):
            if re.match(r'https?://|http://', x):  # Exclude URLs
                return False
            if re.match(r'^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$', x):  # Exclude date strings
                return False
            if x.replace('.', '', 1).isdigit():  # Exclude purely numeric strings
                return False
            if re.search(r'[A-Za-z]', x):  # Check if it contains any alphabetic character
                return True
        return False

    # Identify columns with word identifiers
    identifier_columns = [i for i in range(data.shape[1]) if data.iloc[:, i].apply(is_non_link_word).any()]
    return identifier_columns

def rename_columns(columns, identifier_columns):
    """
    Rename columns based on identified word identifiers and the last two columns.

    :param columns: List of original column names
    :param identifier_columns: List of column indices with word identifiers
    :return: List of new column names
    """
    new_columns = columns.tolist()

    # Rename the last two columns to "value" and "date"
    new_columns[-2] = "value"
    new_columns[-1] = "date"

    # Rename based on the number of word identifier columns found
    if len(identifier_columns) >= 2:
        new_columns[identifier_columns[0]] = "category"
        new_columns[identifier_columns[1]] = "name"
    elif len(identifier_columns) == 1:
        new_columns[identifier_columns[0]] = "name"

    return new_columns

def is_datetime_string(s):
    # Check if a string follows a common datetime format using regex
    datetime_pattern = r'^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$'
    return bool(re.match(datetime_pattern, str(s)))