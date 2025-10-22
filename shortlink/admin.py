from django.contrib import admin
from django.utils.html import format_html


from shortlink.models import ShortLink


@admin.register(ShortLink)
class ShortLinkAdmin(admin.ModelAdmin):
    list_display = ["id", "url", "query"]

    def url(self, obj):
        encoded = obj.encoded_id()
        link = f"/s/{encoded}/"
        return format_html(f'<a href="{link}">{link}/</a>')
