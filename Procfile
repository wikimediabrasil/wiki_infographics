web: gunicorn --bind=0.0.0.0:8000 --workers=4 --forwarded-allow-ips=* infographics.wsgi:application
migrate: python manage.py migrate
