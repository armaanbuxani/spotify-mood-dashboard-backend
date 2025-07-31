from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
from routes.spotify import spotify_bp
from routes.genius import genius_bp
from routes.openai import openai_bp
import os

load_dotenv()

app = Flask(__name__)
CORS(app)

app.register_blueprint(spotify_bp)
app.register_blueprint(genius_bp)
app.register_blueprint(openai_bp)

@app.route('/')
def home():
    return "Music Mood Dashboard Backend Running!"

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)