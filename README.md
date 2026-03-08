# Goose Collab

## Problem

At the University of Waterloo, students often have strong ideas but struggle to find the right collaborators to actually build them. A student in Engineering may need a designer from Arts, a business-minded teammate from AFM or Math, or a health-focused student for a wellness-related project. Right now, finding cross-disciplinary teammates is fragmented, informal, and inefficient.

Students usually rely on word of mouth, Discord servers, Instagram stories, hackathon channels, or chance encounters. This makes it difficult to:

- Find teammates outside your own faculty
- Assess what skills someone actually has
- Discover projects that fit your interests and availability
- Build balanced teams with the right combination of technical and non-technical strengths

Goose Collab solves this by acting as a cross-faculty collaborator matchmaking platform for Waterloo students. It helps users build profiles, showcase skills and project ideas, browse other projects, and get matched based on skills, interests, availability, and project requirements.

## Features/Functionality

### 1. User Profiles
Users can create and edit a profile that includes:
- username
- program and year
- bio
- skills
- project history
- project ideas
- availability
- LinkedIn
- GitHub

This allows students to present both their technical background and what they are looking for in a team.

### 2. Project Listings
Users can browse a list of projects and project ideas. Each listing can include:
- title
- description
- required skills
- preferred skills
- project resources such as GitHub links or screenshots

This makes it easy for students to discover active opportunities.

### 3. Matchmaking System
Goose Collab includes a matchmaking concept inspired by structured role matching systems like WaterlooWorks:
- mandatory skills are separated from preferred skills
- each skill can be weighted by importance
- projects can be ranked based on compatibility with a user’s profile
- results can be filtered and sorted

This helps users find the most relevant teammates and project opportunities instead of manually searching through everything.

### 4. Availability Tracking
Users can indicate their availability using structured weekly availability data. This helps distinguish between:
- Available for larger projects
- Available for smaller projects
- Busy

This is useful for matching students not only by skill, but also by realistic scheduling compatibility.

### 5. Portfolio Integration
Users can include:
- resume links
- GitHub repositories
- LinkedIn profiles
- project screenshots or external resources

This gives teams more confidence when choosing collaborators.

### 6. Project Idea Upload Function
Students can post early-stage ideas even before a full team exists. This is especially helpful for:
- hackathon ideas
- startup ideas
- side projects
- interdisciplinary campus tools

### 7. Search and Discovery
The platform is designed to support searching through public project manuals, project ideas, and user information to make discovery easier and more structured.


## Tech Stack

### Frontend
- React
- Tailwind CSS
- Figma for UI/UX design and planning

### Backend
- Python
- Flask

### Database
- Firebase Firestore

### Authentication / User Data
- Flask-based form handling and user management
- Firebase integration for cloud data storage

### Other Tools
- GitHub for version control
- HTML/CSS for templating and page structure during early implementation

## Instructions




## Citations

The development of Goose Collab involved the use of several tools and resources for brainstorming, debugging, and improving development efficiency.

AI-assisted development tools, such as ChatGPT and Claude Code, were used in a limited capacity to support parts of the workflow, including:
- brainstorming and refining initial feature ideas and system structure
- assisting with debugging and testing individual backend and frontend components
- minor formatting and UI refinement for certain frontend elements such as the profile availability calendar
- converting some existing Flask-based HTML structures into React-compatible components during frontend restructuring

These tools were used primarily as development aids to accelerate iteration and troubleshooting, while the overall system design, architecture, and core functionality were implemented by the project team.

Additional resources used during development include:
- Firebase Firestore documentation
- Flask documentation
- React documentation
- Tailwind CSS documentation