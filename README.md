# Wiki Infographics

Wiki Infographics is a platform to leverage structured information within Wikimedia projects to create informative and visually engaging infographics in both fixed and dynamic formats, under an open license. It is available at <https://infographics.toolforge.org>.

The tool is composed of a Django backend and a React frontend, both on this repository.

## Running locally

To run the tool locally, you need Docker and Docker Compose.

```bash
docker-compose up --build
```

Open the app at <http://localhost:7840>.

If you make any changes, you can kill the process and run again, or restart the app container with `docker-compose up -d --build --force-recreate app`.

## License

This project is licensed under the [MIT License](https://opensource.org/license/mit) - see the LICENSE file for details.
