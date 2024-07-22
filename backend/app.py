import os
import yaml
import mwoauth
import configparser
from flask_cors import CORS
from flask_babel import Babel
from flask_sqlalchemy import SQLAlchemy
from flask import Flask, jsonify, request, json, session, redirect, url_for, flash, render_template


__dir__ = os.path.dirname(__file__)
app = Flask(__name__)


# ==================================================================================================================== #
# CONFIGURATION
# ==================================================================================================================== #

app.config.update(yaml.safe_load(open(os.path.join(__dir__, 'config.yaml'))))


@app.before_request
def require_login():
    """
    Function to enforce login requirement before accessing certain routes.
    This function will be executed before every request. It checks if the 
    endpoint being accessed is one of the public routes. If not, it verifies 
    whether the user is authenticated by checking the 'username' in the session.
    If the user is not authenticated and tries to access a protected route, 
    it returns a 401 Unauthorized response with an error message.
    """
    # List of routes that do not require authentication
    public_routes = ('index', 'login', 'logout', 'oauth_callback', 'static', 'set_locale')

    # Check if the current endpoint is not in the public routes and the user is not authenticated
    if request.endpoint not in public_routes and 'username' not in session:
        
        return jsonify({"error": "Authentication required. Please log in."}), 401


# ----- Cross-Origin Resource Sharing configuration ----- #
CORS(app, supports_credentials=True)


# ----- Database configuration ----- #
HOME = os.environ.get('HOME') or ""
replica_path = HOME + '/replica.my.cnf'
if os.path.exists(replica_path):
    config = configparser.ConfigParser()
    config.read(replica_path)
    user_and_password = f"{config['client']['user']}:{config['client']['password']}"
    host_and_database = f"tools.db.svc.wikimedia.cloud/{app.config['DATABASE_NAME']}"
    app.config["SQLALCHEMY_DATABASE_URI"] = f"mysql+pymysql://{user_and_password}@{host_and_database}"
else:
    app.config["SQLALCHEMY_DATABASE_URI"] = 'sqlite:///' + os.path.join(HOME, 'database.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)


class Todo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)

    def __str__(self):
        return f"{self.id} {self.content}"


def todo_serializer(todo):
    """
    This function serializes a Todo object into a dictionary.
    :param todo: Todo object to serialize.
    :return: Dictionary representation of the Todo object with 'id' and 'content' keys.
    """
    return {"id": todo.id, "content": todo.content}


# ----- Translation configuration ----- #
def get_locale(lang=None):
    """
    This function gets the language preferred by the current user
    :param lang: language code ISO 639
    :return: language code preferred by the current user or the best match for it
    """
    if not lang:
        lang = session.get('language', None)

        return lang if not lang else request.accept_languages.best_match(app.config["LANGUAGES"])


@app.route('/set_locale')
def set_locale():
    """
    This function sets the interface language to the language preferred by the current user
    :return:
    """
    lang = request.args.get('language', None)
    if not lang:
        lang = request.accept_languages.best_match(app.config["LANGUAGES"])

    session["language"] = lang
    return redirect(url_for('home'))


BABEL = Babel(app)
BABEL.init_app(app, locale_selector=get_locale)


# ==================================================================================================================== #
# AUTHENTICATION
# ==================================================================================================================== #

@app.route('/login')
def login():
    """
    Initiates the OAuth login process for the user.
    Creates a consumer token using the provided consumer key and secret,
    then sends a request to initiate the OAuth process. If successful,
    stores the request token in the session and returns a JSON response 
    with the redirect URL. On failure, logs the error and returns a 500 response.
    :return: JSON response containing the redirect URL or an error message.
    """
    consumer_token = mwoauth.ConsumerToken(app.config['CONSUMER_KEY'], app.config['CONSUMER_SECRET'])
    try:
        redirect_, request_token = mwoauth.initiate(app.config['OAUTH_MWURI'], consumer_token)
    except Exception:
        app.logger.exception('mwoauth.initiate failed')
        return jsonify({"error": "OAuth initiation failed"}), 500
    else:
        session['request_token'] = dict(zip(request_token._fields, request_token))

        # For only Flask setup it would be - return redirect(redirect_)
        return jsonify({"redirect_url": redirect_})


# For only Flask setup it would be : 
# - ('/oauth-callback', methods=["GET"])
# - No data would be expected(request_data = json.loads(request.data)) 
#   as the Wikimedia callback URL would be the Flask server end-point 
#   "/oauth-callback"
# - query_string would be from Flask's request(request.query_string)
# - function return would be - "return redirect(url_for('index'))"
@app.route('/oauth-callback', methods=["POST"]) 
def oauth_callback():
    """
    Handles the OAuth callback, completing the authentication process.
    This function:
    - Parses the incoming request data for the query string.
    - Checks if the request token is stored in the session.
    - Ensures the query string is present.
    - Creates a consumer token for OAuth.
    - Attempts to complete the OAuth process and retrieve the access token.
    - Identifies the user and stores the access token and username in the session.
    :return: JSON response indicating success or failure of authentication.
    """

    request_data = json.loads(request.data)
    query_string = request_data["queryString"].encode("utf-8")  #converts to the acceptable encoded datatype(b'query_string')
    
    if 'request_token' not in session:
        return jsonify({"error": "OAuth callback failed. Are cookies disabled?"}), 400
    
    if query_string is None:
        return jsonify({"error": "OAuth callback failed. Query string missing or invalid"}), 400

    consumer_token = mwoauth.ConsumerToken(app.config['CONSUMER_KEY'], app.config['CONSUMER_SECRET'])

    try:
        access_token = mwoauth.complete(
            app.config["OAUTH_MWURI"],
            consumer_token,
            mwoauth.RequestToken(**session['request_token']),
            query_string
        )
        identity = mwoauth.identify(app.config['OAUTH_MWURI'], consumer_token, access_token)
    except Exception:
        app.logger.exception('OAuth authentication failed')
        return jsonify({"error": "OAuth authentication failed"}), 500
    else:
        session['access_token'] = dict(zip(access_token._fields, access_token))
        session['username'] = identity['username']

    return jsonify({"msg": "Authenticaction sucessfull"})


@app.route('/logout')
def logout():
    """
    This function logs the user out by clearing their session
    :return: JSON response indicating success.
    """
    session.clear()

    # For only Flask setup it would be - return redirect(url_for('index'))
    return jsonify({"msg": "logged out successfully"})


@app.route("/user-info")
def get_user_info():
    """
    Retrieves the logged-in user's information.
    This function:
    - Checks if the username is stored in the session.
    - Returns the username if it exists.
    - Returns an authentication prompt message if the user is not logged in.
    :return: JSON response with username or authentication prompt.
    """
    username = session.get("username", None)
    if username:
        return jsonify({"username": username})
    
    return jsonify({"error": "Authentication required. Please log in."}), 401


# ==================================================================================================================== #
# QUERY
# ==================================================================================================================== #

@app.route('/', methods=['GET'])
def home():
    username = session.get('username', None)

    return jsonify({"username": username})


@app.route("/api", methods=["GET"])
def get_all():
    todos = [todo_serializer(todo) for todo in Todo.query.all()]

    return jsonify(todos)


@app.route("/api/create", methods=["POST"])
def create():
    request_data = json.loads(request.data)
    todo = Todo(content=request_data["content"])

    db.session.add(todo)
    db.session.commit()

    return jsonify({'msg': "Todo created successfully"}), 201


@app.route("/api/<int:id>", methods=["GET"])
def show(id):

    return jsonify(todo_serializer(Todo.query.get_or_404(id)))


@app.route("/api/<int:id>", methods=["DELETE"])
def delete(id):
    todo = Todo.query.get_or_404(id)
    db.session.delete(todo)
    db.session.commit()

    return jsonify({'msg': "Deleted successfully"}), 204


@app.route("/api/<int:id>", methods=["PUT"])
def update(id):
    request_data = json.loads(request.data)
    todo = db.session.get(Todo, id)
    if not todo:
        return jsonify({"error": "Todo not found"}), 404
    todo.content = request_data.get("content", todo.content)
    db.session.commit()

    return jsonify({'msg': "Updated successfully"}), 200


if __name__ == '__main__':
    with app.app_context():
        print("Creating tables...")
        db.create_all()
        print("Tables created successfully.")
    app.run(debug=True, port=8000)
