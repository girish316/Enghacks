from flask import Flask
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Allow requests from your React/Next.js origin

@app.route("/heyyy")
def hello_world():
    return {"message": "girish is an attractive man"}  # Return JSON for API