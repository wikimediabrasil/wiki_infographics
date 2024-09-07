# Wiki Infographics

Wiki Infographics is a platform to leverage structured information within Wikimedia projects to create informative and visually engaging infographics in both fixed and dynamic formats, under an open license. It is available at https://infographics.toolforge.org.

The backend codebase is available in this repository [wiki_infographics-backend](https://github.com/WikiMovimentoBrasil/wiki_infographics-backend)

## Table of Contents

- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Contributing](#contributing)
- [License](#license)

## Getting started:

### Prerequisites

Before you begin, ensure you have met the following requirements:

- Nodejs >= v18.16.0

### Installation

1. Clone the repository

   ```bash
   git clone https://github.com/WikiMovimentoBrasil/wiki_infographics.git

   ```

2. Navigate to the project directory:

   ```bash
   cd wiki_infographics

   ```

3. Install project dependencies:

   ```bash
   npm install

   ```

4. Start the development server:
   ```bash
    npm run dev
   ```

You should now be able to access the project at http://localhost:5173 in your web browser

To connect backend with this frontend go to this repository
[wiki_infographics-backend](https://github.com/WikiMovimentoBrasil/wiki_infographics-backend)

## Running in toolforge

### Rebuild the image (after a code change)
```
> ssh login.toolforge.org
> toolforge~# become <yourtool>
> yourtool@toolforge~# toolforge build start <url_for_this_repo>
> yourtool@toolforge~# toolforge webservice buildservice restart
```

More info on buildservice (debugging, etc.) [here](https://wikitech.wikimedia.org/wiki/Help:Toolforge/Build_Service)

## Contributing

Contributions are welcome! To contribute to Wiki Infographics, follow these steps:

1. Fork the repository
2. Create a new branch: git checkout -b feature/your-feature
3. Make your changes and commit them: git commit -m 'Add some feature'
4. Push to the branch: git push origin feature/your-feature
5. Create a pull request on GitHub

## Todos

- [ ] Save users successful SPARQL queries
- [ ] Export Bar chart race video functionality Or embed bar chart race chart functionality
- [ ] Improve accessibility

## License

This project is licensed under the [MIT License](https://opensource.org/license/mit) - see the LICENSE file for details.
