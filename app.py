from flask import Flask, render_template

app = Flask(__name__, template_folder='client/build', static_folder='client/build/static')

@app.route("/")
def index():
    return render_template("index.html")