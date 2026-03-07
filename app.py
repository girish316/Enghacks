from flask import Flask, render_template, request, redirect, url_for, session
import firebase_admin
from firebase_admin import credentials, auth, firestore
from werkzeug.security import generate_password_hash, check_password_hash


app = Flask(__name__)
projectsList = []

cred = credentials.Certificate("pkey.json")
firebase_admin.initialize_app(cred)

db = firestore.client()


@app.route("/")
def home():
    return render_template("index.html")

@app.route("/profile/<uid>")
def profile(uid):

    user_doc = db.collection("users").document(uid).get()

    if not user_doc.exists:
        return "User not found", 404
    
    user_data = user_doc.to_dict()
    user_data["uid"] = uid
    return render_template("profile.html", user=user_data)

@app.route("/profile/<uid>/edit", methods=["POST"])
def editprofile(uid):

    current_user = session.get("current_user")

    if uid != current_user:
            return "Invalid access", 403

    try:
        username = request.form["username"].strip()
        year = request.form["year"].strip()
        program = request.form["program"].strip()
        skills = [s.strip() for s in request.form["skills"].split(",") if s.strip()]
        projects = [p.strip() for p in request.form["projects"].split(",") if p.strip()]
        bio = request.form["bio"].strip()
        projectIdea = request.form["projectIdea"].strip()

        availability = {
            "monday": int(request.form["monday"]),
            "tuesday": int(request.form["tuesday"]),
            "wednesday": int(request.form["wednesday"]),
            "thursday": int(request.form["thursday"]),
            "friday": int(request.form["friday"]),
            "saturday": int(request.form["saturday"]),
            "sunday": int(request.form["sunday"])
        }

        linkedin = request.form["linkedin"].strip()
        github = request.form["github"].strip()
        resume = request.form["resume"].strip()


        db.collection("users").document(uid).set({
            "username": username,
            "program": program,
            "year": year,
            "projects": projects,
            "bio": bio,
            "projectIdea": projectIdea,
            "skills": skills,
            "availability": availability,
            "linkedin": linkedin,
            "github": github,
            "resume": resume,
        }, merge=True)

        return redirect(url_for("profile", uid=uid))

    except Exception as e:
        return f"Error updating profile: {e}"


@app.route("/projects")
def projects():
    return render_template("projects.html", projects = projectsList)

@app.route("/addProject", methods = ["POST"])
def addProject():
    project = {
                "title": request.form["title"],
                "description": request.form["description"], 
                "skills": request.form["skills"],  
               }
    projectsList.append(project)
    return redirect("/projects")

@app.route("/adduser", methods = ["POST"])
def adduser():
    try:
        username = request.form["username"].strip()
        password = generate_password_hash(request.form["password"].strip())
        program = request.form["program"].strip()
        year = request.form["year"].strip()

        user_doc = db.collection("users").document(username).get()
        if user_doc.exists:
            return "Username already exists", 400

        db.collection('users').document(username).set(
            {
                "username": username,
                "password": password,
                "program": program,
                "year": year,
                "projects": [],
                "bio": "",
                "projectIdea": "",
                "skills": "",
                "availability": {},
                "linkedin": "",
                "github": "",
                "resume": "",
            }
        )

        session["current_user"] = username

        return redirect(url_for("profile", uid=username))

    except Exception as e:
        return f"Error creating account: {e}", 400
    

@app.route("/signin", methods=["POST"])
def signin():
    try:
        username = request.form["username"].strip()

        user_doc = db.collection("users").document(username).get()
        if not user_doc.exists:
            return "User not found", 404

        password = request.form["password"].strip()

        if check_password_hash(user_doc.to_dict()[password], password):
            session["current_user"] = username
            return redirect(url_for("profile", username))
        else:
            return "Incorrect password", 401
    except Exception as e:
        return f"Error signing in: {e}", 400


@app.route("/logout")
def logout():
    session.pop("current_user", None)
    return redirect(url_for("home"))

if __name__ == "__main__":
    app.run(debug = True)



