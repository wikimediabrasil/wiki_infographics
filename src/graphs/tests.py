import pandas as pd
from django.test import TestCase
from django.utils.timezone import now

from graphs.table import process_table
from graphs.bar_chart_race import process_bar_chart_race


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
        self.assertEqual(msg, "number of columns must be between 3 and 6")
        df["new column"] = "abcdef"
        msg = process_bar_chart_race(df)["failed"]
        self.assertEqual(msg, "last column must be a date column")
        df["new column"] = now()
        msg = process_bar_chart_race(df)["failed"]
        self.assertEqual(msg, "second to last column must be a quantity column")
        df["new column"] = 2
        df["last column"] = now()
        res = process_bar_chart_race(df)
        self.assertNotIn("failed", res)
