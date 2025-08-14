web: gunicorn --bind=0.0.0.0:8000 --workers=4 --forwarded-allow-ips=* infographics.wsgi:application
npminstall: npm --prefix ./client install
migrate: python manage.py migrate
dev: python manage.py runserver 0.0.0.0:8000
