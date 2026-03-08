from flask import Flask, render_template, request, redirect, url_for, session, jsonify
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, auth, firestore
from werkzeug.security import generate_password_hash, check_password_hash


app = Flask(__name__)
CORS(app, supports_credentials=True)  # Enable CORS for frontend development
projectsList = []

cred = credentials.Certificate("pkey.json")
firebase_admin.initialize_app(cred)

db = firestore.client()



# ============== HTML Routes (for backward compatibility) ==============
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

@app.route("/projects")
def projects():
    return render_template("projects.html", projects = projectsList)


# ============== API Routes (for frontend development) ==============

# Health check endpoint
@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


# User Management APIs
@app.route("/api/user/<uid>", methods=["GET"])
def get_user(uid):
    """Fetch user profile data"""
    try:
        user_doc = db.collection("users").document(uid).get()
        if not user_doc.exists:
            return jsonify({"error": "User not found"}), 404
        
        user_data = user_doc.to_dict()
        user_data["uid"] = uid
        return jsonify(user_data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route("/api/user/create", methods=["POST"])
def api_adduser():
    """Create a new user"""
    try:
        data = request.get_json()
        username = data.get("username", "").strip()
        password = data.get("password", "").strip()
        program = data.get("program", "").strip()
        year = data.get("year", "").strip()

        if not username or not password:
            return jsonify({"error": "Username and password required"}), 400

        user_doc = db.collection("users").document(username).get()
        if user_doc.exists:
            return jsonify({"error": "Username already exists"}), 400

        db.collection('users').document(username).set(
            {
                "username": username,
                "password": generate_password_hash(password),
                "program": program,
                "year": year,
                "projects": [],
                "bio": "",
                "projectIdea": "",
                "skills": [],
                "availability": {},
                "linkedin": "",
                "github": "",
                "resume": "",
            }
        )

        session["current_user"] = username
        return jsonify({"message": "User created successfully", "uid": username}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route("/api/user/<uid>", methods=["PUT"])
def api_editprofile(uid):
    """Update user profile"""
    try:
        current_user = session.get("current_user")
        
        if uid != current_user:
            return jsonify({"error": "Invalid access"}), 403

        data = request.get_json()
        
        # Extract and validate data
        update_data = {}
        if "username" in data:
            update_data["username"] = data["username"].strip()
        if "year" in data:
            update_data["year"] = data["year"].strip()
        if "program" in data:
            update_data["program"] = data["program"].strip()
        if "skills" in data:
            if isinstance(data["skills"], list):
                update_data["skills"] = data["skills"]
            else:
                update_data["skills"] = [s.strip() for s in data["skills"].split(",") if s.strip()]
        if "projects" in data:
            if isinstance(data["projects"], list):
                update_data["projects"] = data["projects"]
            else:
                update_data["projects"] = [p.strip() for p in data["projects"].split(",") if p.strip()]
        if "bio" in data:
            update_data["bio"] = data["bio"].strip()
        if "projectIdea" in data:
            update_data["projectIdea"] = data["projectIdea"].strip()
        if "availability" in data:
            update_data["availability"] = data["availability"]
        if "linkedin" in data:
            update_data["linkedin"] = data["linkedin"].strip()
        if "github" in data:
            update_data["github"] = data["github"].strip()
        if "resume" in data:
            update_data["resume"] = data["resume"].strip()

        db.collection("users").document(uid).set(update_data, merge=True)
        
        # Fetch and return updated user data
        updated_user = db.collection("users").document(uid).get().to_dict()
        updated_user["uid"] = uid
        return jsonify(updated_user), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route("/api/signin", methods=["POST"])
def api_signin():
    """Sign in user"""
    try:
        data = request.get_json()
        username = data.get("username", "").strip()
        password = data.get("password", "").strip()

        if not username or not password:
            return jsonify({"error": "Username and password required"}), 400

        user_doc = db.collection("users").document(username).get()
        if not user_doc.exists:
            return jsonify({"error": "User not found"}), 404

        user_data = user_doc.to_dict()
        if not check_password_hash(user_data.get("password", ""), password):
            return jsonify({"error": "Incorrect password"}), 401

        session["current_user"] = username
        user_data["uid"] = username
        return jsonify({"message": "Signed in successfully", "user": user_data}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route("/api/logout", methods=["POST"])
def api_logout():
    """Sign out user"""
    session.pop("current_user", None)
    return jsonify({"message": "Logged out successfully"}), 200


@app.route("/api/user/current", methods=["GET"])
def get_current_user():
    """Get currently logged in user"""
    current_user = session.get("current_user")
    if not current_user:
        return jsonify({"error": "Not logged in"}), 401
    
    try:
        user_doc = db.collection("users").document(current_user).get()
        if not user_doc.exists:
            return jsonify({"error": "User not found"}), 404
        
        user_data = user_doc.to_dict()
        user_data["uid"] = current_user
        return jsonify(user_data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400


# Projects APIs
@app.route("/api/projects", methods=["GET"])
def api_get_projects():
    """Get all projects"""
    return jsonify(projectsList), 200


@app.route("/api/projects", methods=["POST"])
def api_addProject():
    """Add a new project"""
    try:
        data = request.get_json()
        
        project = {
            "title": data.get("title", "").strip(),
            "description": data.get("description", "").strip(), 
            "skills": data.get("skills", []) if isinstance(data.get("skills"), list) else data.get("skills", "").split(","),
        }
        
        if not project["title"]:
            return jsonify({"error": "Project title required"}), 400
        
        projectsList.append(project)
        return jsonify(project), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

        username = data.get("username", "").strip()
        password = data.get("password", "").strip()
        program = data.get("program", "").strip()
        year = data.get("year", "").strip()

        if not username or not password:
            return jsonify({"error": "Username and password required"}), 400

        user_doc = db.collection("users").document(username).get()
        if user_doc.exists:
            return jsonify({"error": "Username already exists"}), 400

        db.collection('users').document(username).set(
            {
                "username": username,
                "password": generate_password_hash(password),
                "program": program,
                "year": year,
                "projects": [],
                "bio": "",
                "projectIdea": "",
                "skills": [],
                "availability": {},
                "linkedin": "",
                "github": "",
                "resume": "",
            }
        )

        session["current_user"] = username

        return jsonify({"message": "User created successfully", "uid": username}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 400
    

@app.route("/signin", methods=["POST"])
def signin():
    """Form-based sign in (deprecated - use /api/signin instead)"""
    try:
        username = request.form["username"].strip()
        user_doc = db.collection("users").document(username).get()
        if not user_doc.exists:
            return "User not found", 404

        password = request.form["password"].strip()
        user_data = user_doc.to_dict()

        if check_password_hash(user_data.get("password", ""), password):
            session["current_user"] = username
            return redirect(url_for("profile", uid=username))
        else:
            return "Incorrect password", 401
    except Exception as e:
        return f"Error signing in: {e}", 400


@app.route("/logout")
def logout():
    """Form-based logout (deprecated - use /api/logout instead)"""
    session.pop("current_user", None)
    return redirect(url_for("home"))

if __name__ == "__main__":
    app.run(debug=True, port=5000)

