from flask import Flask

app = Flask(__name__)

@app.route("/heyyy")
def hello_world():
    print("girish is an attractive man")