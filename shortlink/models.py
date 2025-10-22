from django.db import models
from sqids import Sqids


class ShortLinkManager(models.Manager):
    def sqids(self):
        return Sqids()

    def encode(self, id):
        return self.sqids().encode([id])

    def decode(self, encoded):
        return self.sqids().decode(encoded)[0]

    def encoded_id_from_query(self, query):
        short_link, created = self.get_or_create(query=query)
        return self.encode(short_link.id)

    def query_from_encoded_id(self, encoded):
        id = self.decode(encoded)
        return self.get(id=id).query


class ShortLink(models.Model):
    query = models.TextField()

    objects = ShortLinkManager()
