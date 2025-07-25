import requests_mock
from django.test import TestCase

from query.sparql import df_from_query


class TestHelper:
    @staticmethod
    def mock_query_table(mocker):
        result = {
            "head": {"vars": ["item", "itemLabel"]},
            "results": {
                "bindings": [
                    {
                        "item": {
                            "type": "uri",
                            "value": "http://www.wikidata.org/entity/Q9686073",
                        },
                        "itemLabel": {
                            "xml:lang": "pt",
                            "type": "literal",
                            "value": "Campo Novo",
                        },
                    },
                    {
                        "item": {
                            "type": "uri",
                            "value": "http://www.wikidata.org/entity/Q6669324",
                        },
                        "itemLabel": {
                            "xml:lang": "pt",
                            "type": "literal",
                            "value": "Lomba do Pinheiro",
                        },
                    },
                ]
            },
        }
        mocker.get("https://query.wikidata.org/sparql", json=result)


class QueryTests(TestCase):
    @requests_mock.Mocker()
    def test_basic_df(self, mocker):
        TestHelper.mock_query_table(mocker)
        df = df_from_query("")
        self.assertEqual(df.columns[0], "item")
        self.assertEqual(df.columns[1], "itemLabel")
        self.assertEqual(df["item"][0], "http://www.wikidata.org/entity/Q9686073")
        self.assertEqual(df["item"][1], "http://www.wikidata.org/entity/Q6669324")
        self.assertEqual(df["itemLabel"][0], "Campo Novo")
        self.assertEqual(df["itemLabel"][1], "Lomba do Pinheiro")
        self.assertEqual(df["item"].count(), 2)
