import pandas as pd
from numpy import nan
from django.test import TestCase
from django.utils.timezone import now

from graphs.table import process_table
from graphs.bar_chart_race import process_bar_chart_race
from graphs.bar_chart_race import BaseDf
from graphs.bar_chart_race import DfProcessor


class TestHelper:
    @staticmethod
    def mock_df_table():
        return pd.DataFrame(
            [
                {
                    "item": "http://www.wikidata.org/entity/Q9686073",
                    "itemLabel": "Campo Novo",
                },
                {
                    "item": "http://www.wikidata.org/entity/Q6669324",
                    "itemLabel": "Lomba do Pinheiro",
                },
            ]
        )

    @staticmethod
    def mock_df_bcr():
        return pd.DataFrame(
            [
                {
                    "item": "http://www.wikidata.org/entity/Q40269",
                    "itemLabel": "Porto Alegre",
                    "population": 1332845,
                    "date": "2022-01-01T00:00:00Z",
                },
                {
                    "item": "http://www.wikidata.org/entity/Q43463",
                    "itemLabel": "Fortaleza",
                    "population": 2428708,
                    "date": "2022-01-01T00:00:00Z",
                },
                {
                    "item": "http://www.wikidata.org/entity/Q174",
                    "itemLabel": "São Paulo",
                    "population": 12325232,
                    "date": "2020-07-01T00:00:00Z",
                },
            ]
        )


class QueryTests(TestCase):
    def test_basic_table(self):
        df = TestHelper.mock_df_table()
        table = process_table(df)
        self.assertEqual(table["columns"], ["item", "itemLabel"])
        self.assertEqual(
            table["data"],
            [
                {
                    "item": "http://www.wikidata.org/entity/Q9686073",
                    "itemLabel": "Campo Novo",
                },
                {
                    "item": "http://www.wikidata.org/entity/Q6669324",
                    "itemLabel": "Lomba do Pinheiro",
                },
            ],
        )

    def test_bcr_base_errors(self):
        df = TestHelper.mock_df_table()
        msg = process_bar_chart_race(df)["failed"]
        self.assertEqual(msg, "number of columns must be between 3 and 5")

        df = TestHelper.mock_df_table()
        df["A"] = "A"
        df["B"] = 1234
        df["C"] = now()
        df["D"] = "D"
        msg = process_bar_chart_race(df)["failed"]
        self.assertEqual(msg, "number of columns must be between 3 and 5")

        df = TestHelper.mock_df_table()
        df["new column"] = "abcdef"
        msg = process_bar_chart_race(df)["failed"]
        self.assertEqual(msg, "last column must be a date column")

        df = TestHelper.mock_df_table()
        df["new column"] = now()
        msg = process_bar_chart_race(df)["failed"]
        self.assertEqual(msg, "second to last column must be a quantity column")

        df = TestHelper.mock_df_table()
        df["new column"] = 2
        df["last column"] = now()
        res = process_bar_chart_race(df)
        self.assertNotIn("failed", res)

        df = TestHelper.mock_df_table()
        df["new column"] = 2
        df["last column"] = "2025-01-01"
        res = process_bar_chart_race(df)
        self.assertNotIn("failed", res)

        df = TestHelper.mock_df_bcr()
        df.drop(columns="itemLabel", inplace=True)
        msg = process_bar_chart_race(df)["failed"]
        self.assertEqual(msg, "there should be at least one label")

        df = TestHelper.mock_df_bcr()
        df.drop(columns="item", inplace=True)
        res = process_bar_chart_race(df)
        self.assertNotIn("failed", res)

    def test_base_df(self):
        df = TestHelper.mock_df_bcr()
        BaseDf(df).prepare()
        self.assertEqual(set(df.columns), set(("name", "url", "value", "date")))

    def test_df_processor(self):
        df = TestHelper.mock_df_bcr()
        bdf = BaseDf(df).prepare()
        proc = DfProcessor(bdf)
        elements = proc.elements()
        self.assertEqual(
            elements,
            [
                {"name": "Fortaleza", "url": "http://www.wikidata.org/entity/Q43463"},
                {"name": "Porto Alegre", "url": "http://www.wikidata.org/entity/Q40269"},
                {"name": "São Paulo", "url": "http://www.wikidata.org/entity/Q174"},
            ],
        )
        ip = proc.interpolated_df()
        self.assertEqual(
            list(ip[ip["name"] == "São Paulo"]["value"]),
            [
                12325232.0,
                12325232.0,
                12325232.0,
            ],
        )
        self.assertEqual(
            list(ip[ip["name"] == "Porto Alegre"]["value"].fillna(0)),
            [
                0,
                0,
                1332845.0,
            ],
        )
        self.assertEqual(
            list(ip[ip["name"] == "Fortaleza"]["value"].fillna(0)),
            [
                0,
                0,
                2428708.0,
            ],
        )
