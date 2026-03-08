from datetime import datetime
from flask import Flask, request, session, jsonify
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, auth, firestore
from werkzeug.security import generate_password_hash, check_password_hash
import uuid


app = Flask(__name__)
CORS(app, supports_credentials=True)  # Enable CORS for frontend development

# Set secret key for session management
app.secret_key = 'temp-key'

cred = credentials.Certificate("pkey.json")
firebase_admin.initialize_app(cred)

db = firestore.client()

# Health check endpoint
@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


# user profile APIs
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

# Add a new user to db
@app.route("/api/user/create", methods=["POST"])
def api_adduser():
    """Create a new user"""
    try:
        data = request.get_json()
        username = data.get("username", "").strip()
        password = data.get("password", "").strip()
        program = data.get("program", "").strip()
        year = data.get("year", "").strip()
        email = data.get("email", "").strip()

        if not username or not password:
            return jsonify({"error": "Username and password required"}), 400

        user_doc = db.collection("users").document(username).get()
        if user_doc.exists:
            return jsonify({"error": "Username already exists"}), 400

        # Create new user document with metadata
        user_data = {
            "username": username,
            "password": generate_password_hash(password),
            "program": program,
            "year": year,
            "email": email,
            "projects": [],
            "bio": "",
            "projectIdea": "",
            "skills": [],
            "availability": {},
            "linkedin": "",
            "github": "",
            "resume": "",
            "createdAt": firestore.SERVER_TIMESTAMP,
            "updatedAt": firestore.SERVER_TIMESTAMP,
            "userId": str(uuid.uuid4()),  # Unique user ID
            "isActive": True,
        }
        
        # Save to Firebase
        db.collection('users').document(username).set(user_data)

        session["current_user"] = username
        return jsonify({"message": "User created successfully", "uid": username}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 400

# Update user profile
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
        if "email" in data:
            update_data["email"] = data["email"].strip()
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

        # Add updated timestamp
        update_data["updatedAt"] = firestore.SERVER_TIMESTAMP

        # Save to Firebase with merge=True to preserve existing fields
        db.collection("users").document(uid).set(update_data, merge=True)
        
        # Fetch and return updated user data
        updated_user = db.collection("users").document(uid).get().to_dict()
        updated_user["uid"] = uid
        return jsonify(updated_user), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 400

# Sign in api endpoint
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

# Get all users from Firestore (admin/matching purposes)
@app.route("/api/users", methods=["GET"])
def get_all_users():
    """Get all users from Firestore (public profiles only)"""
    try:
        docs = db.collection("users").stream()
        users = []
        for doc in docs:
            user_data = doc.to_dict()
            user_data["uid"] = doc.id
            # Remove sensitive data
            user_data.pop("password", None)
            users.append(user_data)
        return jsonify(users), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# Delete user account
@app.route("/api/user/<uid>", methods=["DELETE"])
def delete_user(uid):
    """Delete user account"""
    try:
        current_user = session.get("current_user")
        if uid != current_user:
            return jsonify({"error": "Invalid access"}), 403
        
        db.collection("users").document(uid).delete()
        session.pop("current_user", None)
        return jsonify({"message": "User deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# Get currently logged in user API endpoint
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


# Projects APIs (stored in Firestore)
PROJECTS_COLLECTION = "projects"

# Get all projects from firestore
@app.route("/api/projects", methods=["GET"])
def api_get_projects():
    """Get all projects from Firestore"""
    try:
        docs = db.collection(PROJECTS_COLLECTION).stream()
        projects = []
        for doc in docs:
            data = doc.to_dict()
            data["id"] = doc.id
            projects.append(data)
        projects.sort(key=lambda p: p.get("createdAt") or datetime.min, reverse=True)
        return jsonify(projects), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# Add a new project to firestore
@app.route("/api/projects", methods=["POST"])
def api_addProject():
    """Add a new project to Firestore"""
    try:
        data = request.get_json()
        title = data.get("title", "").strip()
        description = data.get("description", "").strip()
        skills = data.get("skills", []) if isinstance(data.get("skills"), list) else (data.get("skills", "") or "").split(",")
        skills = [s.strip() for s in skills if s.strip()]

        if not title:
            return jsonify({"error": "Project title required"}), 400

        project = {
            "title": title,
            "description": description,
            "skills": skills,
            "createdAt": firestore.SERVER_TIMESTAMP,
        }
        current_user = session.get("current_user")
        if current_user:
            project["createdBy"] = current_user

        ref = db.collection(PROJECTS_COLLECTION).add(project)
        project["id"] = ref[1].id
        return jsonify(project), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400


if __name__ == "__main__":
    app.run(debug=True, port=5000)

