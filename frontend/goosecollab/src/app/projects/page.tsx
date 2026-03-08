"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState, useEffect } from "react";
import { getCurrentUser, updateUserProfile } from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type Project = {
  title: string;
  description: string;
  skills?: string[] | string;
  id?: string;
  createdBy?: string;
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [skills, setSkills] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  useEffect(() => {
    // Get current user
    getCurrentUser()
      .then((user) => setCurrentUser(user.uid))
      .catch(() => setCurrentUser(null));

    // Load projects
    fetch(`${API_URL}/api/projects`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setProjects(Array.isArray(data) ? data : []))
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`${API_URL}/api/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          skills: skills.trim() ? skills.split(",").map((s) => s.trim()) : [],
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to add project");
      }
      const project = await res.json();
      setProjects((prev) => [...prev, project]);

      // Add project to user's profile
      if (currentUser) {
        try {
          const currentUserData = await getCurrentUser();
          const updatedProjects = [...(currentUserData.projects || []), title.trim()];
          await updateUserProfile(currentUser, {
            projects: updatedProjects,
          });
        } catch (err) {
          console.error("Failed to update user projects:", err);
          // Don't fail the whole operation, just log the error
        }
      }

      setSuccess("✅ Project created and added to your profile!");
      setTitle("");
      setDescription("");
      setSkills("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add project");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="mx-auto max-w-3xl px-6 py-12">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Projects</h1>
          {currentUser && (
            <Link href={`/profile/${currentUser}`}>
              <Button className="bg-blue-600 hover:bg-blue-700 text-sm">
                👁️ View Your Profile
              </Button>
            </Link>
          )}
        </div>

        <section className="mt-8">
          <h2 className="mb-4 text-lg font-semibold text-zinc-300">Add a Project</h2>
          {error && (
            <p className="mb-4 text-sm text-red-400">❌ {error}</p>
          )}
          {success && (
            <p className="mb-4 text-sm text-green-400">{success}</p>
          )}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="mb-1 block text-sm text-zinc-400">Project Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Karaoke Generator"
                required
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-white placeholder:text-zinc-500 focus:border-zinc-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-zinc-400">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What are you building?"
                required
                rows={3}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-white placeholder:text-zinc-500 focus:border-zinc-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-zinc-400">Skills Needed</label>
              <input
                type="text"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="e.g. Python, Java, React"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-white placeholder:text-zinc-500 focus:border-zinc-600 focus:outline-none"
              />
            </div>
            <Button
              type="submit"
              disabled={submitting}
              className="w-fit bg-zinc-700 text-white hover:bg-zinc-600"
            >
              {submitting ? "Creating…" : "Create Project"}
            </Button>
          </form>
        </section>

        <section className="mt-12">
          <h2 className="mb-4 text-lg font-semibold text-zinc-300">All Projects</h2>
          {loading ? (
            <p className="text-zinc-500">Loading projects...</p>
          ) : projects.length === 0 ? (
            <p className="text-zinc-500">No projects yet. Add one above.</p>
          ) : (
            <ul className="space-y-4">
              {projects.map((p, i) => (
                <li
                  key={i}
                  className="rounded-lg border border-zinc-800 bg-zinc-900 p-4"
                >
                  <h3 className="font-medium">{p.title}</h3>
                  <p className="mt-1 text-sm text-zinc-400">{p.description}</p>
                  {p.skills && (
                    <p className="mt-2 text-xs text-zinc-500">
                      Skills:{" "}
                      {Array.isArray(p.skills) ? p.skills.join(", ") : p.skills}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
