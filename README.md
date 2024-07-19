# wiki_infografics
platform to leverage structured information within Wikimedia projects to create informative and visually engaging infographics in both fixed and dynamic formats, under an open license

## Getting started:
1. Clone the repository
```
git clone https://github.com/WikiMovimentoBrasil/wiki_infographics.git
```
2. Enter the project directory
```
cd wiki_infographics
```
3. Create a virtual environment
```
cd .\backend\
```
```
python -m venv venv
```
4. Activate the virtual environment
```
.\venv\Scripts\activate
```
5. Install backend dependencies
```
pip install -r requirements.txt
```
6. create a `config.yaml` file in your backend directory and add to it the following variables
```
SECRET_KEY: a randomly generated secret value
CONSUMER_KEY: Your oauth key from the oauth consumer registration
CONSUMER_SECRET: Your oauth secret from the oauth consumer registration
OAUTH_MWURI: "https://meta.wikimedia.org/w/index.php"
```
7. Start the backend server in development
```
python app.py
```
8. Open a new terminal and move into frontend directory
```
cd .\frontend\
```
9. Install frontend dependencies
```
npm install
```
10. Start the fronted in development
```
npm run dev
```
11. Go to frontend address [http://localhost:5173/](http://localhost:5173/) to view the app

