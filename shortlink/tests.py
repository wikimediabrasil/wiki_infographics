from django.test import TestCase

from .models import ShortLink


class ShortLinkTests(TestCase):
    QUERY = """
#title: population of Brazilian non-capital municipalities
SELECT ?item ?itemLabel ?stateLabel ?population ?date WHERE {
  ?item wdt:P31 wd:Q3184121.
  ?item p:P1082 ?population_node.
  ?population_node ps:P1082 ?population.
  ?population_node pq:P585 ?date.
  ?population_node pq:P459 wd:Q39825. # only census
  MINUS { ?item wdt:P1376 []. } # remove capitals
  ?item wdt:P131 ?state. # group by state
  FILTER (?date >= "1970-01-01"^^xsd:dateTime) # after 1970
  SERVICE wikibase:label { bd:serviceParam wikibase:language "pt-br". }
}
"""

    def test_encode_and_decode(self):
        encoded = ShortLink.objects.encoded_id_from_query(self.QUERY)
        query = ShortLink.objects.query_from_encoded_id(encoded)
        self.assertEqual(query, self.QUERY)

    def test_existant_query(self):
        sl = ShortLink.objects.create(query=self.QUERY)
        encoded = ShortLink.objects.encoded_id_from_query(self.QUERY)
        encoded2 = ShortLink.objects.encode(sl.id)
        self.assertEqual(
            ShortLink.objects.decode(encoded),
            ShortLink.objects.decode(encoded2),
        )

    def test_url(self):
        encoded = ShortLink.objects.encoded_id_from_query("abc def\nghi")
        res = self.client.get(f"/s/{encoded}/")
        self.assertEqual(res.status_code, 302)
        self.assertEqual(
            res.headers["Location"],
            "/web/infographics/?query=abc%20def%0Aghi",
        )
        res = self.client.get("/s/abc/")
        self.assertEqual(res.status_code, 404)
        ShortLink.objects.all().delete()
        res = self.client.get(f"/s/{encoded}/")
        self.assertEqual(res.status_code, 404)
