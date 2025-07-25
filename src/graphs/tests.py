import pandas as pd
from django.test import TestCase

from graphs.table import process_table


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
