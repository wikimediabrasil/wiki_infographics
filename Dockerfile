FROM docker-registry.tools.wmflabs.org/toolforge-node18-sssd-web:latest AS frontend

COPY client /client
WORKDIR /client

RUN npm install
RUN npm run build

FROM docker-registry.tools.wmflabs.org/toolforge-python311-sssd-web:latest AS backend

WORKDIR /root/www/python/

COPY src/requirements.txt ./src/requirements.txt
COPY src/requirements-dev.txt ./src/requirements-dev.txt
RUN cat ./src/requirements-dev.txt >> ./src/requirements.txt
RUN webservice-python-bootstrap
ENV PATH="/root/www/python/venv/bin:${PATH}"

COPY src ./src
WORKDIR /root/www/python/src/

COPY --from=frontend /client/dist/index.html ./web/templates/index.html
COPY --from=frontend /client/dist/assets ./web/static/frontend/assets

EXPOSE 7840
CMD ["/bin/bash", "-c", "source ../venv/bin/activate && \
  python3 manage.py collectstatic --no-input && \
  python3 manage.py migrate && \
  python3 manage.py runserver 0.0.0.0:7840"]
