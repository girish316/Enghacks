from flask import Flask, render_template, request, redirect

app = Flask(__name__)

projectsList = []

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/projects")
def projects():
    return render_template("projects.html", projects = projectsList)

@app.route("/addProject", methods = ["POST"])
def addProject():
    project = {
                "title": request.form["title"],
                "description": request.form["description"], 
                "skills": request.form["skills"],  
                "availability": request.form["availability"]
               }
    projects.append(project)
    return redirect("/projects")

if __name__ == "__main__":
    app.run(debug = True)



