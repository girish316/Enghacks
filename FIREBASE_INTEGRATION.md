# Firebase Integration Guide

## Overview

Your app.py is now fully integrated with Firebase Firestore for user management. All user data is automatically saved to the Firebase database.

## What's Automatically Saved to Firebase

### User Collection (`users`)

When a user is created or updated, the following data is stored in Firestore:

```
{
  username: string,
  password: hashed_string,
  program: string,
  year: string,
  email: string,
  bio: string,
  projectIdea: string,
  skills: string[],
  projects: string[],
  availability: object,
  linkedin: string,
  github: string,
  resume: string,
  userId: UUID,              // Unique identifier
  isActive: boolean,         // Account status
  createdAt: timestamp,      // Auto-generated on creation
  updatedAt: timestamp,      // Auto-updated on changes
}
```

### Projects Collection (`projects`)

Projects are also saved to Firestore with:

```
{
  title: string,
  description: string,
  skills: string[],
  createdBy: string,         // Username who created it
  createdAt: timestamp,      // Auto-generated
}
```

## API Endpoints for User Management

### Create User (Registration)
- **POST** `/api/user/create`
- **Body**: `{ username, password, program, year, email? }`
- **Response**: `{ message, uid }`
- **Saves to**: `users/{username}` in Firestore

### Get User Profile
- **GET** `/api/user/<uid>`
- **Response**: Full user object from Firebase
- **Retrieves from**: `users/{uid}` in Firestore

### Get Current User
- **GET** `/api/user/current`
- **Response**: Logged-in user's profile
- **Requires**: Session/Authentication

### Update User Profile
- **PUT** `/api/user/<uid>`
- **Body**: Any user fields to update (partial)
- **Saves to**: `users/{uid}` in Firestore with `merge=True`
- **Auto-adds**: `updatedAt` timestamp

### Get All Users
- **GET** `/api/users`
- **Response**: Array of all user profiles (passwords removed)
- **Use case**: User discovery, matching, admin dashboard

### Delete User
- **DELETE** `/api/user/<uid>`
- **Deletes from**: `users/{uid}` in Firestore
- **Effect**: Clears session

### Sign In
- **POST** `/api/signin`
- **Body**: `{ username, password }`
- **Validation**: Checks password hash against Firestore
- **Response**: User object with session created

### Sign Out
- **POST** `/api/logout`
- **Effect**: Clears session

## Frontend API Usage

All endpoints are pre-configured in `src/lib/api.ts`:

```typescript
import {
  createUser,
  getCurrentUser,
  updateUserProfile,
  getAllUsers,
  deleteUser,
  signIn,
  signOut,
} from "@/lib/api";

// Sign up
await createUser({
  username: "john",
  password: "secure123",
  program: "Computer Science",
  year: "2nd",
  email: "john@example.com",
});

// Sign in
await signIn({ username: "john", password: "secure123" });

// Get current user
const user = await getCurrentUser();

// Update profile
await updateUserProfile("john", {
  bio: "Software engineer",
  skills: ["React", "TypeScript", "Node.js"],
});

// Get all users for discovery
const allUsers = await getAllUsers();

// Sign out
await signOut();

// Delete account
await deleteUser("john");
```

## Firebase Collections Structure

### In Firebase Console:
```
Firestore Database
├── users
│   ├── john_smith
│   │   ├── username: "john_smith"
│   │   ├── program: "Computer Science"
│   │   ├── email: "john@example.com"
│   │   ├── skills: ["React", "Python"]
│   │   ├── createdAt: 2026-03-07T...
│   │   └── updatedAt: 2026-03-07T...
│   └── jane_doe
│       └── ...
└── projects
    ├── project_id_1
    │   ├── title: "Goose Collab"
    │   ├── createdBy: "john_smith"
    │   └── createdAt: 2026-03-07T...
    └── project_id_2
        └── ...
```

## Key Features

✅ **Automatic Timestamps**: `createdAt` and `updatedAt` are set automatically by Firebase
✅ **Password Hashing**: Passwords are hashed using werkzeug before saving
✅ **Merge Updates**: Profile updates don't overwrite existing fields
✅ **User Tracking**: Each user gets a unique UUID
✅ **Session Management**: Sessions track authenticated users
✅ **Data Isolation**: Users can only modify their own profile
✅ **Public Discovery**: `GET /api/users` returns sanitized profiles without passwords

## Testing Firebase Integration

### 1. Create a Test User

```bash
curl -X POST http://localhost:5000/api/user/create \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "testpass123",
    "program": "CS",
    "year": "2",
    "email": "test@example.com"
  }'
```

### 2. Check Firebase Console

Go to [Firebase Console](https://console.firebase.google.com/) and verify the document was created in `Firestore Database > users > testuser`

### 3. Fetch User Data

```bash
curl http://localhost:5000/api/user/testuser
```

### 4. Update User Profile

```bash
curl -X PUT http://localhost:5000/api/user/testuser \
  -H "Content-Type: application/json" \
  -d '{
    "bio": "I love building projects!",
    "skills": ["React", "Node.js"]
  }'
```

### 5. Get All Users

```bash
curl http://localhost:5000/api/users
```

## Troubleshooting

### Users Not Saving to Firebase

**Problem**: Users aren't appearing in Firestore
- Check Firebase credentials in `pkey.json`
- Verify Firestore is enabled in Firebase Console
- Check app.py logs for Firebase errors
- Ensure `db = firestore.client()` is initialized

### Password Hash Errors

**Problem**: Password comparison fails on sign in
- Verify `check_password_hash()` is being used (not direct comparison)
- Check password is hashed on creation with `generate_password_hash()`

### Timestamps Not Showing

**Problem**: `createdAt` and `updatedAt` show as objects
- This is normal! Firebase returns server timestamps as special objects
- Frontend should handle conversion if needed

## Next Steps

1. ✅ Users are saved to Firebase automatically
2. Set up user authentication state in frontend (Context/Redux)
3. Implement user discovery/matching logic
4. Add user preferences and filters
5. Create admin dashboard to view all users

## Reference

- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Flask-CORs](https://flask-cors.readthedocs.io/)
- [Werkzeug Security](https://werkzeug.palletsprojects.com/en/latest/security/)
