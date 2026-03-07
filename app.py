from flask import Flask, render_template, request, redirect, url_for, session
import firebase_admin
from firebase_admin import credentials, auth, firestore
from werkzeug.security import generate_password_hash, check_password_hash


app = Flask(__name__)

@app.route("/heyyy")
def hello_world():
    print("girish is an attractive man")