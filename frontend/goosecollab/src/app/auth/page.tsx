"use client";

import { useState } from "react";
import { createUser, signIn, getCurrentUser, updateUserProfile, type User } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function AuthPage() {
  const [mode, setMode] = useState<"register" | "login" | "profile">("login");
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    program: "",
    year: "",
    email: "",
    bio: "",
    skills: "",
    linkedin: "",
    github: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await createUser({
        username: formData.username,
        password: formData.password,
        program: formData.program,
        year: formData.year,
        email: formData.email,
      });

      setSuccess("✅ Registration successful! Logging in...");
      // Auto-login after registration
      await new Promise((resolve) => setTimeout(resolve, 1500));
      await loadCurrentUser();
      setMode("profile");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await signIn({
        username: formData.username,
        password: formData.password,
      });

      setSuccess("✅ Logged in successfully!");
      setUser(response.user || null);
      setMode("profile");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setMode("profile");
    } catch (err) {
      console.log("Not logged in");
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const updated = await updateUserProfile(user.uid, {
        bio: formData.bio,
        skills: formData.skills.split(",").map((s) => s.trim()),
        linkedin: formData.linkedin,
        github: formData.github,
      });

      setUser(updated);
      setSuccess("✅ Profile updated!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setMode("login");
    setFormData({
      username: "",
      password: "",
      program: "",
      year: "",
      email: "",
      bio: "",
      skills: "",
      linkedin: "",
      github: "",
    });
    setSuccess(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-md mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Goose Collab</h1>
          <p className="text-zinc-400">Test Dashboard</p>
        </div>

        {/* Status Messages */}
        {success && (
          <Card className="mb-4 p-4 bg-green-900 border-green-700">
            <p className="text-green-100">{success}</p>
          </Card>
        )}

        {error && (
          <Card className="mb-4 p-4 bg-red-900 border-red-700">
            <p className="text-red-100">❌ {error}</p>
          </Card>
        )}

        {/* Login Form */}
        {mode === "login" && !user && (
          <Card className="p-6 border-zinc-800">
            <h2 className="text-xl font-bold mb-4">Sign In</h2>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-white placeholder-zinc-500"
                  placeholder="testuser"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-white placeholder-zinc-500"
                  placeholder="••••••••"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <button
              onClick={() => {
                setMode("register");
                setError(null);
                setSuccess(null);
              }}
              className="w-full mt-4 text-blue-400 hover:text-blue-300 text-sm"
            >
              Don't have an account? Register
            </button>
          </Card>
        )}

        {/* Register Form */}
        {mode === "register" && !user && (
          <Card className="p-6 border-zinc-800 max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Create Account</h2>
            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-white placeholder-zinc-500 text-sm"
                  placeholder="Choose a username"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-white placeholder-zinc-500 text-sm"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-white placeholder-zinc-500 text-sm"
                  placeholder="••••••••"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Program</label>
                <input
                  type="text"
                  name="program"
                  value={formData.program}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-white placeholder-zinc-500 text-sm"
                  placeholder="e.g., Computer Science"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Year</label>
                <select
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-white text-sm"
                  required
                >
                  <option value="">Select year</option>
                  <option value="1st">1st Year</option>
                  <option value="2nd">2nd Year</option>
                  <option value="3rd">3rd Year</option>
                  <option value="4th">4th Year</option>
                </select>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-sm"
              >
                {loading ? "Creating..." : "Create Account"}
              </Button>
            </form>

            <button
              onClick={() => {
                setMode("login");
                setError(null);
                setSuccess(null);
              }}
              className="w-full mt-4 text-blue-400 hover:text-blue-300 text-sm"
            >
              Already have an account? Sign In
            </button>
          </Card>
        )}

        {/* Profile View */}
        {mode === "profile" && user && (
          <Card className="p-6 border-zinc-800 max-h-[80vh] overflow-y-auto">
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-2">👤 {user.username}</h2>
              <p className="text-zinc-400 text-sm">{user.email}</p>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Program</label>
                <input
                  type="text"
                  value={user.program}
                  disabled
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-zinc-400 text-sm opacity-60"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-white placeholder-zinc-500 text-sm"
                  placeholder="Tell us about yourself"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Skills (comma-separated)</label>
                <input
                  type="text"
                  name="skills"
                  value={formData.skills}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-white placeholder-zinc-500 text-sm"
                  placeholder="React, Python, Firebase"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">LinkedIn</label>
                <input
                  type="url"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-white placeholder-zinc-500 text-sm"
                  placeholder="https://linkedin.com/in/username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">GitHub</label>
                <input
                  type="url"
                  name="github"
                  value={formData.github}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-white placeholder-zinc-500 text-sm"
                  placeholder="https://github.com/username"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-sm"
              >
                {loading ? "Saving..." : "Save Profile"}
              </Button>
            </form>

            <button
              onClick={handleLogout}
              className="w-full mt-4 text-red-400 hover:text-red-300 text-sm"
            >
              Sign Out
            </button>

            {/* Current User Data Display */}
            <div className="mt-6 p-3 bg-zinc-900 rounded border border-zinc-700">
              <p className="text-xs font-bold text-zinc-400 mb-2">📊 Current Data (Firebase):</p>
              <pre className="text-xs text-zinc-300 overflow-x-auto">
                {JSON.stringify(user, null, 2)}
              </pre>
            </div>
          </Card>
        )}

        {/* Help Text */}
        <div className="mt-8 p-4 bg-zinc-900 border border-zinc-700 rounded text-xs text-zinc-400 space-y-2">
          <p>🎯 <strong>Test Account:</strong></p>
          <p>Username: <code className="bg-black px-1 py-0.5">testuser</code></p>
          <p>Password: <code className="bg-black px-1 py-0.5">test123</code></p>
          <p className="mt-3">💡 Or create a new account to test registration and Firebase storage.</p>
        </div>
      </div>
    </div>
  );
}
