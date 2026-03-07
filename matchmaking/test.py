import json

# Source: Brainstormed matchmaking algorithm by prompting ChatGPT with a first edition (sorted list based on aggregate project skilled weight)
# Based on suggestions, revised a second edition that was ultimately used (added concept of "mandatory skills" and a skill weighting)

# Load json data from testdata.json for now
with open("testdata.json", "r") as file:
    data = json.load(file)

# Helper Function to get project by the id field in the json data
def get_project_by_id(data, project_id):
    for project in data["projects"]:
        if project["id"] == project_id:
            return project
    return None

# Main function to match applicants
def match_applicants(data, project_id):
    project = get_project_by_id(data, project_id)

    # Null Handling
    if project is None:
        print(f"Project with id {project_id} not found.")
        return []

    req_skills = project["required_skills"]
    results = []

    # Loop through users in json
    for user in data["users"]:
        rejected = False
        penalty = 0.0
        weighted_sum = 0.0
        total_weight = 0.0

        # Find skills
        for skill in req_skills:
            skill_name = skill["skill"] 

            # Check what rating is adequate
            required_rating = skill["required_rating"]
            weight = skill["weight"]
            mandatory = skill["mandatory"]

            user_rating = user["skills"].get(skill_name, 0)

            gap = required_rating - user_rating
            # Filter logic for mandatory skills
            if mandatory: 
                if user_rating == 0:
                    rejected = True
                    break

                if gap >= 2:
                    rejected = True
                    break
                elif gap == 1:
                    if required_rating > user_rating:
                        penalty += 0.1
                    else: # Implementation decision to slightly penalize overqualified candidates
                        penalty += 0.03
            else: 
                if gap > 0:
                    penalty += 0.05 * gap # Should not be excluded, but should be a penalty applied. Penalty default value is lower because not required


            # Weighted normalized score
            match_score = min(user_rating / required_rating, 1)
            weighted_sum += weight * match_score
            total_weight += weight 
            # Calc new weight sum based on existing sums already
            
        # Check for eligibility
        if not rejected:
            base_score = weighted_sum / total_weight if total_weight > 0 else 0
            final_score = max(0, base_score - penalty)

            # Only append successful candidates
            results.append({
                "user_id": user["id"],
                "name": user["name"],
                "base_score": round(base_score, 3),
                "penalty": round(penalty, 3),
                "final_score": round(final_score, 3)
            })

    # Sort best to worst (had to look up sorting on python)
    results.sort(key=lambda x: x["final_score"], reverse=True)
    return results


# Test case
project_id = 101
matches = match_applicants(data, project_id)
# To prevent printing "Matches for project {project_id}:" with no project ID
if get_project_by_id(data, project_id) != None:
    print(f"Matches for project {project_id}:")
for match in matches:
    print(
        f"{match['name']} | "
        f"base={match['base_score']} | "
        f"penalty={match['penalty']} | "
        f"final={match['final_score']}"
    )