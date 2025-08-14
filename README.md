# Wiki Infographics

Wiki Infographics is a platform to leverage structured information within Wikimedia projects to create informative and visually engaging infographics in both fixed and dynamic formats, under an open license. It is available at <https://infographics.toolforge.org>.

The tool is composed of a Django backend and a React frontend, both on this repository.

## Running locally

To run the tool locally, have NodeJS, Python, `rsvg-convert` and `ffmpeg` installed. You need two terminals.

In one of them, run the frontend

```bash
npm install
npm run dev
```

And open your browser at <http://localhost:5173/web/infographics/>.

For the backend, run

```bash
python3 manage.py runserver
```

Open the app at <http://localhost:7840>.

If you make any changes, you can kill the process and run again, or restart the app container with `docker-compose up -d --build --force-recreate app`.


## License

This project is licensed under the [MIT License](https://opensource.org/license/mit) - see the LICENSE file for details.

## Toolforge deployment

Since we need apt packages we are using [Toolforge's custom builds feature](https://wikitech.wikimedia.org/wiki/Help:Toolforge/Building_container_images) so that we can have `ffmpeg` and `rsvg-convert` utilities installed.

On toolforge, run the following to clean build space, build the image, run migrations and start the server.

```bash
toolforge build clean -y
toolforge build start https://github.com/wikimediabrasil/wiki_infographics --ref toolforge
toolforge jobs run --image tool-infographics/tool-infographics:latest --command "migrate" --wait --mount=all migrate
toolforge webservice buildservice start --mount all
```

We are using `--mount=all` because we're still using SQLite.

## Running locally with buildpack

This is the way to build the image locally:

```bash
sudo pack build --builder tools-harbor.wmcloud.org/toolforge/heroku-builder:22 --buildpack heroku/nodejs --buildpack heroku/python --buildpack heroku/procfile --buildpack fagiani/apt infographics
sudo docker run -e PORT=8000 -e DEBUG=True -e SECRET_KEY=123 -p 8000:8000 -it  --entrypoint 'bash' infographics
```

Inside the container, you can run `migrate` or `web`. The binaries are not directly available to the path, these fixes are necessary when entering bash:

```bash
source /layers/fagiani_apt/apt/.profile.d/000_apt.sh
cp /layers/fagiani_apt/apt/usr/lib/x86_64-linux-gnu/*/* /layers/fagiani_apt/apt/usr/lib/x86_64-linux-gnu/
```

Then it is possible to run `web` and have `ffmpeg` and `rsvg-convert` installed.

