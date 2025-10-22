import requests_mock
from django.test import TestCase

from api.sparql import df_from_query
from video.models import Video
from shortlink.models import ShortLink


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


class VideoTests(TestCase):
    TEST_SVG = """<svg><circle r="45" cx="50" cy="50"/></svg>"""

    def test_basic_video_endpoints(self):
        res = self.client.post("/api/video/create/")
        video = Video.objects.get()
        self.assertEqual(res.status_code, 201)
        self.assertEqual(res.json(), {"id": video.id})
        endpoint = f"/api/video/{video.id}/frame/"
        res = self.client.post(endpoint, data={"ordering": 0.32, "svg": self.TEST_SVG})
        self.assertEqual(res.status_code, 201)
        res = self.client.post(endpoint, data={"ordering": 1.43333, "svg": self.TEST_SVG})
        self.assertEqual(res.status_code, 201)
        res = self.client.post(endpoint, data={"ordering": 2.0909099, "svg": self.TEST_SVG})
        self.assertEqual(res.status_code, 201)
        self.assertEqual(video.frames.count(), 3)
        res = self.client.post(endpoint, data={"svg": self.TEST_SVG})
        self.assertEqual(res.status_code, 400)
        self.assertEqual(res.json(), {"msg": "missing parameters"})
        res = self.client.post(endpoint, data={"ordering": 1.234, "svg": "<svg>Empty svg</svg>"})
        self.assertEqual(res.status_code, 400)
        self.assertEqual(res.json(), {"msg": "failed to convert svg to png"})
        endpoint = "/api/video/0/frame/"
        res = self.client.post(endpoint, data={"ordering": 0.32, "svg": self.TEST_SVG})
        self.assertEqual(res.status_code, 404)

    def test_generate(self):
        self.client.post("/api/video/create/")
        video = Video.objects.get()
        endpoint = f"/api/video/{video.id}/frame/"
        for i in range(50):
            self.client.post(endpoint, data={"ordering": i, "svg": self.TEST_SVG})
        self.assertEqual(video.frames.count(), 50)
        #
        endpoint = f"/api/video/{video.id}/generate/"
        res = self.client.get(endpoint)
        self.assertEqual(res.status_code, 400)
        self.assertEqual(res.json(), {"msg": "missing parameters"})
        #
        res = self.client.get(f"{endpoint}?framerate=abcdef")
        self.assertEqual(res.status_code, 400)
        self.assertEqual(res.json(), {"msg": "invalid framerate"})
        #
        res = self.client.get(f"{endpoint}?framerate=")
        self.assertEqual(res.status_code, 400)
        self.assertEqual(res.json(), {"msg": "invalid framerate"})
        #
        res = self.client.get(f"{endpoint}?framerate=36")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res["Content-Disposition"], 'filename="video.webm"')
        self.assertEqual(res["Access-Control-Expose-Headers"], "Content-Disposition")
        self.assertEqual(res["Content-Type"], "video/webm")
        video.refresh_from_db()
        self.assertIsNotNone(video.file)
        self.assertEqual(video.file_framerate, 36)

class ShortLinkTests(TestCase):
    def test_generate(self):
        query = "SELECT\n?abc"
        res = self.client.post("/api/shortlink/generate/", {"query": query})
        self.assertEqual(res.status_code, 201)
        encoded = ShortLink.objects.encoded_id_from_query(query)
        url = f"/s/{encoded}/"
        self.assertEqual(res.json(), {"url": url})
        res = self.client.get(url)
        self.assertEqual(res.status_code, 302)
        self.assertEqual(
            res.headers["Location"],
            "/web/infographics/?query=SELECT%0A%3Fabc",
        )
