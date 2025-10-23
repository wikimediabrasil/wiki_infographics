import re
import logging
from datetime import datetime
from datetime import timedelta
from concurrent.futures import ThreadPoolExecutor

import pandas as pd
from pandas.errors import ParserError

logger = logging.getLogger("django")

MAX_ELEMENTS_SCREEN = 12


class BaseDf:
    UNKNOWN = "http://www.wikidata.org/.well-known/genid"

    def __init__(self, df: pd.DataFrame):
        self.df = df

    def prepare(self) -> "BaseDf":
        self.verify_column_count()
        self.remove_uknowns()
        self.prepare_date_column()
        self.prepare_value_column()
        self.prepare_identifier_columns()
        self.drop_other_columns()
        self.drop_duplicates()
        return self

    def verify_column_count(self):
        if not (3 <= self.df.shape[1] <= 5):
            raise BaseDfException("number of columns must be between 3 and 5")

    def remove_uknowns(self):
        for col in self.df.columns:
            unknowns = self.df[col].astype(str).str.startswith(self.UNKNOWN)
            if unknowns.sum() > 0:
                self.df = self.df[~unknowns]

    def prepare_date_column(self):
        original_name = self.df.columns[-1]
        try:
            self.df[original_name] = pd.to_datetime(
                self.df[original_name], format="ISO8601"
            )
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
            if re.match(r"^https?://.*", first) and "url" not in renamer.values():
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

    def drop_duplicates(self):
        self.df.drop_duplicates(["name", "date"], inplace=True)


class BaseDfException(Exception):
    def __init__(self, message):
        self.message = message
        return super().__init__(message)


class DfProcessor:
    def __init__(self, bdf: BaseDf, time_unit: str = "year"):
        self.df = bdf.df.copy()
        self.time_unit = time_unit
        if self.time_unit == "year":
            self.df["date"] = self.df["date"].dt.strftime("%Y-01-01")
        elif self.time_unit == "month":
            self.df["date"] = self.df["date"].dt.strftime("%Y-%m-01")
        else:
            self.df["date"] = self.df["date"].dt.strftime("%Y-%m-%d")

    def elements(self):
        identifiers = [col for col in ["url", "category"] if col in self.df.columns]
        if not identifiers:
            return [{"name": name for name in self.df["name"].unique()}]
        agg = {col: "first" for col in identifiers}
        return (
            self.df[["name", *identifiers]]
            .groupby("name")
            .agg(agg)
            .reset_index()
            .to_dict("records")
        )

    def name_to_category(self):
        if "category" in self.df.columns:
            return self.df[["name", "category"]].drop_duplicates().set_index("name")["category"].to_dict()
        else:
            return {}

    def year_count(self):
        min_year = int(self.df["date"].min()[:4])
        max_year = int(self.df["date"].max()[:4])
        return max_year - min_year + 1

    def interpolated_df(self):
        df = self.df
        names = df["name"].unique()
        time_units = self.all_time_units()
        mux = pd.MultiIndex.from_product(
            [names, time_units],
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
        df["value"] = df["value"].fillna(0)
        df["rank"] = df.groupby("date")["value"].rank(method="first", ascending=False)
        if "category" in self.df.columns:
            mapper = self.name_to_category()
            df["category"] = df["name"].apply(lambda name: mapper.get(name))
        return df

    def all_time_units(self):
        min_year = int(self.df["date"].min()[:4])
        max_year = int(self.df["date"].max()[:4])
        year_range = range(min_year, max_year + 1)
        if self.time_unit == "year":
            year_range = range(min_year, max_year + 1)
            return [f"{y}-01-01" for y in year_range]
        elif self.time_unit == "month":
            start_month = int(self.df["date"].min()[5:7])
            start = [f"{min_year}-{m:02d}-01" for m in range(start_month, 13)]
            year_range = list(year_range)
            year_range.pop(0)
            if len(year_range) == 0:
                return start
            year_range.pop(-1)
            between = [
                f"{y}-{m}"
                for m in [
                    "01-01",
                    "02-01",
                    "03-01",
                    "04-01",
                    "05-01",
                    "06-01",
                    "07-01",
                    "08-01",
                    "09-01",
                    "10-01",
                    "11-01",
                    "12-01",
                ]
                for y in year_range
            ]
            end_month = int(self.df["date"].max()[5:7])
            end = [f"{max_year}-{m:02d}-01" for m in range(1, end_month + 1)]
            return [*start, *between, *end]
        else:
            start_date = datetime.strptime(self.df["date"].min(), "%Y-%m-%d").date()
            end_date = datetime.strptime(self.df["date"].max(), "%Y-%m-%d").date()
            days = (end_date - start_date).days + 1
            days_index = []
            for n in range(days):
                date = start_date + timedelta(days=n)
                days_index.append(date.strftime("%Y-%m-%d"))
            return days_index

    def values_by_date(self):
        ip = self.interpolated_df()
        head = MAX_ELEMENTS_SCREEN * 2  # times 2 to be safe
        vl = []
        last = None
        for date, grouped in (
            ip.sort_values(["date", "rank"], ascending=[False, True])
            .groupby("date", sort=False)
            .head(head)
            .groupby("date", sort=False)
        ):
            if last is not None:
                last = last[~last.name.isin(grouped["name"])]
                if last.shape[0] > 0:
                    last["rank"] = (
                        last["value"].rank(method="first", ascending=False)
                        + grouped[grouped["value"] > 0 ]["rank"].max()
                    )
                    last["value"] = 0.0
                    grouped = pd.concat([grouped, last])
            values = grouped.to_dict(orient="records")
            vl.append({"date": date, "values": values})
            last = grouped[grouped["value"] > 0]
        vl.reverse()
        return vl


def process_bar_chart_race(df):
    bdf = BaseDf(df)
    try:
        bdf.prepare()
    except BaseDfException as e:
        return {"failed": e.message}
    proc = DfProcessor(bdf)
    elements = proc.elements()
    data = {"elements": elements}
    run_daily = proc.year_count() <= 25
    proc_monthly = DfProcessor(bdf, time_unit="month")
    proc_daily = DfProcessor(bdf, time_unit="day")
    with ThreadPoolExecutor() as executor:
        t = executor.submit(proc.values_by_date)
        t_monthly = executor.submit(proc_monthly.values_by_date)
        if run_daily:
            t_daily = executor.submit(proc_daily.values_by_date)
        data["values_by_date"] = t.result()
        data["values_by_date_monthly"] = t_monthly.result()
        if run_daily:
            data["values_by_date_daily"] = t_daily.result()
    return data
