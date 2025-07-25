import pandas as pd
from pandas.errors import ParserError
import re

class BaseDf:
    def __init__(self, df: pd.DataFrame):
        self.df = df

    def prepare(self) -> "BaseDf":
        self.verify_column_count()
        self.prepare_date_column()
        self.prepare_value_column()
        self.prepare_identifier_columns()
        self.drop_other_columns()
        return self

    def verify_column_count(self):
        if not (3 <= self.df.shape[1] <= 5):
            raise BaseDfException("number of columns must be between 3 and 5")
        
    def prepare_date_column(self):
        original_name = self.df.columns[-1]
        try:
            # TODO: allow other units of time
            self.df[original_name] = pd.to_datetime(self.df[original_name], format="ISO8601").dt.year
        except (ValueError, ParserError):
            raise BaseDfException("last column must be a date column")
        self.df.rename(columns={original_name: "date"}, inplace=True)

    def prepare_value_column(self):
        original_name = self.df.columns[-2]
        try:
            self.df[original_name] = self.df[original_name].astype("float")
        except ValueError:
            raise BaseDfException("second to last column must be a quantity column")
        self.df.rename(columns={original_name: "value"}, inplace=True)

    def prepare_identifier_columns(self):
        renamer = {}
        for column in self.df.columns[:-2]:
            first = self.df[column][0]
            if re.match(r"^https?://.*", first):
                renamer[column] = "url"
                continue
            if "name" in renamer.values():
                renamer[column] = "category"
            else:
                renamer[column] = "name"
        if list(renamer.values()) == ["url"] or len(renamer) == 0:
            raise BaseDfException("there should be at least one label")
        self.df.rename(columns=renamer, inplace=True)

    def drop_other_columns(self):
        keep = ["name", "category", "url", "value", "date"]
        drop = [col for col in self.df.columns if col not in keep]
        self.df.drop(columns=drop, inplace=True)



class BaseDfException(Exception):
    def __init__(self, message):
        self.message = message
        return super().__init__(message)


class DfProcessor:
    def __init__(self, bdf: BaseDf):
        self.df = bdf.df

    def elements(self):
        identifiers = [col for col in ["url", "category"] if col in self.df.columns]
        if not identifiers:
            return {name: {} for name in self.df["name"].unique()}
        agg = {col: "first" for col in identifiers}
        return (
            self.df[["name", *identifiers]].groupby("name").agg(agg).to_dict("index")
        )

    def interpolated_df(self):
        df = self.df
        mux = pd.MultiIndex.from_product(
            [df["name"].unique(), range(df["date"].min(), df["date"].max() + 1)],
            names=["name", "date"],
        )
        df = (
            df.drop_duplicates(["name", "date"])
            .set_index(["name", "date"])
            .reindex(mux)
            .reset_index()
            .pivot(index="date", columns=["name"], values="value")
            .interpolate()
            .melt(ignore_index=False)
            .reset_index()
        )
        return df


def process_bar_chart_race(df):
    """
    Process data for bar chart race visualization.

    :param data: DataFrame containing the processed data
    :return: Processed data suitable for bar chart race or error message
    """

    bdf = BaseDf(df)
    try:
        bdf.prepare()
    except BaseDfException as e:
        return {"failed": e.message}

    proc = DfProcessor(bdf)
    _elements = proc.elements() # TODO: use this to control category + url
    ip = proc.interpolated_df()
    ip["value"] = ip["value"].astype(str)
    ip["date"] = ip["date"].astype(str) + "-01-01"

    result =  ip.to_dict(orient='records')
    return result
