/**
 * API Client for communication with Flask backend
 * Backend runs on http://localhost:5000
 * Frontend runs on http://localhost:3000
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface FetchOptions extends RequestInit {
  headers?: Record<string, string>;
}

/**
 * Make authenticated API request with error handling
 */
async function apiCall<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const response = await fetch(url, {
    ...options,
    credentials: "include", // Include cookies for session management
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `API Error: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

// ============ User Management ============

export interface User {
  uid: string;
  username: string;
  program: string;
  year: string;
  email?: string;
  bio: string;
  projectIdea: string;
  skills: string[];
  projects: string[];
  availability: Record<string, number>;
  linkedin: string;
  github: string;
  resume: string;
  userId?: string;
  isActive?: boolean;
  createdAt?: any;
  updatedAt?: any;
}

export interface AuthResponse {
  message: string;
  user?: User;
  uid?: string;
}

/**
 * Fetch user profile by UID
 */
export async function getUser(uid: string): Promise<User> {
  return apiCall(`/api/user/${uid}`);
}

/**
 * Get currently logged in user
 */
export async function getCurrentUser(): Promise<User> {
  return apiCall("/api/user/current");
}

/**
 * Create new user (sign up)
 */
export async function createUser(data: {
  username: string;
  password: string;
  program: string;
  year: string;
  email?: string;
}): Promise<AuthResponse> {
  return apiCall("/api/user/create", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Sign in user
 */
export async function signIn(data: {
  username: string;
  password: string;
}): Promise<AuthResponse> {
  return apiCall("/api/signin", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Sign out user
 */
export async function signOut(): Promise<{ message: string }> {
  return apiCall("/api/logout", {
    method: "POST",
  });
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  uid: string,
  data: Partial<User>
): Promise<User> {
  return apiCall(`/api/user/${uid}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

/**
 * Get all users (public profiles)
 */
export async function getAllUsers(): Promise<User[]> {
  return apiCall("/api/users");
}

/**
 * Delete user account
 */
export async function deleteUser(uid: string): Promise<{ message: string }> {
  return apiCall(`/api/user/${uid}`, {
    method: "DELETE",
  });
}

// ============ Projects ============

export interface Project {
  title: string;
  description: string;
  skills: string[];
}

/**
 * Get all projects
 */
export async function getProjects(): Promise<Project[]> {
  return apiCall("/api/projects");
}

/**
 * Add new project
 */
export async function addProject(data: Project): Promise<Project> {
  return apiCall("/api/projects", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ============ Health & Status ============

/**
 * Check if backend API is accessible
 */
export async function checkHealth(): Promise<{ status: string }> {
  return apiCall("/api/health");
}
