"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type User = {
  uid: string;
  username?: string;
  program?: string;
  year?: string;
  bio?: string;
  projectIdea?: string;
  skills?: string[] | string;
  linkedin?: string;
  github?: string;
  resume?: string;
  availability?: Record<string, number>;
};

const RATING = 3.4;

const DAY_TO_KEY: Record<string, string> = {
  Sun: "sunday",
  Mon: "monday",
  Tue: "tuesday",
  Wed: "wednesday",
  Thu: "thursday",
  Fri: "friday",
  Sat: "saturday",
};

function availabilityToSet(av?: Record<string, number>): Set<string> {
  if (!av) return new Set();
  const keyToDay: Record<string, string> = {
    sunday: "Sun",
    monday: "Mon",
    tuesday: "Tue",
    wednesday: "Wed",
    thursday: "Thu",
    friday: "Fri",
    saturday: "Sat",
  };
  const set = new Set<string>();
  Object.entries(av).forEach(([day, val]) => {
    if (val && keyToDay[day.toLowerCase()]) set.add(keyToDay[day.toLowerCase()]);
  });
  return set;
}

function setToAvailability(days: Set<string>): Record<string, number> {
  const av: Record<string, number> = {};
  DAYS.forEach((d) => {
    av[DAY_TO_KEY[d]] = days.has(d) ? 1 : 0;
  });
  return av;
}

export default function ProfilePage() {
  const params = useParams();
  const uid = params.uid as string;
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDays, setSelectedDays] = useState<Set<string>>(new Set());
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {

    fetch(`${API_URL}/api/user/${uid}`, { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("User not found");
        return res.json();
      })
      .then((data) => {
        setUser(data);
        setSelectedDays(availabilityToSet(data.availability));
      })
      .catch(() => setError("User not found"))
      .finally(() => setLoading(false));
  }, [uid]);

  useEffect(() => {
    fetch(`${API_URL}/api/user/current`, { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setCurrentUser(data?.uid ?? null))
      .catch(() => setCurrentUser(null));
  }, []);

  const handleSave = () => {
    if (uid === "demo") {
      setSaveMessage("Demo profile cannot be edited");
      return;
    }
    
    setSaving(true);
    setSaveMessage(null);
    fetch(`${API_URL}/api/user/${uid}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ availability: setToAvailability(selectedDays) }),
    })
      .then((res) => {
        if (!res.ok) throw new Error(res.status === 403 ? "You can only edit your own profile" : "Failed to save");
        return res.json();
      })
      .then((updated) => {
        setUser(updated);
        setSaveMessage("Saved to Firebase");
      })
      .catch((err) => setSaveMessage(err.message))
      .finally(() => setSaving(false));
  };

  const handleClick = (day: string) => {
    setSelectedDays((prev) => {
      const next = new Set(prev);
      if (next.has(day)) next.delete(day);
      else next.add(day);
      return next;
    });
  };

  const skillsList = user?.skills
    ? Array.isArray(user.skills)
      ? user.skills
      : [user.skills]
    : [];
  const displayName = user?.username || uid || "User";
  const displayTitle = [user?.program, user?.year].filter(Boolean).join(" · ") + (user?.year && " year") || "—";

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <main className="flex min-h-[60vh] items-center justify-center">
          <p className="text-zinc-500">Loading profile...</p>
        </main>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-black text-white">
        <main className="flex min-h-[60vh] items-center justify-center">
          <p className="text-zinc-500">{error || "User not found"}</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="mx-auto flex max-w-6xl gap-0 py-12 px-8">
        <aside className="flex w-72 shrink-0 flex-col items-start border-r border-zinc-800 pr-8">
          <div className="relative mb-4">
            <Avatar className="size-28 border-2 border-zinc-700">
              <AvatarImage src="" alt={displayName} />
              <AvatarFallback className="bg-zinc-800 text-zinc-400 text-2xl">
                {displayName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
          <h1 className="text-xl font-bold tracking-tight">{displayName}</h1>
          <p className="mb-4 text-sm text-zinc-400">{displayTitle}</p>
          <div className="flex gap-2">
            {user.linkedin && (
              <Button
                variant="secondary"
                size="sm"
                className="bg-zinc-800 text-white hover:bg-zinc-700"
                onClick={() => window.open(user.linkedin, "_blank")}
              >
                LinkedIn
              </Button>
            )}
            {user.github && (
              <Button
                variant="secondary"
                size="sm"
                className="bg-zinc-800 text-white hover:bg-zinc-700"
                onClick={() => window.open(user.github, "_blank")}
              >
                GitHub
              </Button>
            )}
          </div>
          {user.resume && (
            <Button
              variant="secondary"
              className="mt-3 w-full bg-zinc-700 text-white hover:bg-zinc-600"
              onClick={() => window.open(user.resume, "_blank")}
            >
              View Resume
            </Button>
          )}
          <div className="mt-4 flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((i) => {
              const fill = Math.min(1, Math.max(0, RATING - (i - 1)));
              return (
                <div key={i} className="relative size-5 shrink-0" aria-hidden="true">
                  <Star className="size-5 fill-none text-zinc-500" />
                  {fill > 0 && (
                    <div
                      className="absolute inset-0 overflow-hidden"
                      style={{ width: `${fill * 100}%` }}
                    >
                      <Star className="size-5 fill-yellow-400 text-yellow-400" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <p className="mt-1 text-xs text-zinc-500">3.4/5 stars from 34 ratings</p>
        </aside>

        <div className="flex-1 space-y-6 pl-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              <section>
                <h2 className="mb-2 text-lg font-bold">Bio</h2>
                <div className="min-h-[80px] rounded-lg bg-zinc-900 px-4 py-3 text-zinc-400">
                  {user.bio || "—"}
                </div>
              </section>
              <section>
                <h2 className="mb-2 text-lg font-bold">Project Description</h2>
                <div className="min-h-[80px] rounded-lg bg-zinc-900 px-4 py-3 text-zinc-400">
                  {user.projectIdea || "—"}
                </div>
              </section>
              <section>
                <h2 className="mb-2 text-lg font-bold">Technical Skills</h2>
                <div className="min-h-[44px] rounded-lg bg-zinc-900 px-4 py-3 text-zinc-400">
                  {skillsList.length ? skillsList.join(", ") : "—"}
                </div>
              </section>
              <section>
                <h2 className="mb-2 text-lg font-bold">Availability</h2>
                {currentUser === uid && (
                  <div className="mb-2 flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={handleSave}
                      disabled={saving}
                      className="bg-green-600 text-white hover:bg-green-500"
                    >
                      {saving ? "Saving…" : "Save to Firebase"}
                    </Button>
                    {saveMessage && (
                      <span className="text-sm text-zinc-400">{saveMessage}</span>
                    )}
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  {DAYS.map((day) => (
                    <Button
                      key={day}
                      variant="secondary"
                      size="sm"
                      onClick={() => handleClick(day)}
                      className={
                        selectedDays.has(day)
                          ? "bg-green-600 text-white hover:bg-green-500"
                          : "bg-zinc-800 text-white hover:bg-zinc-700"
                      }
                    >
                      {day}
                    </Button>
                  ))}
                </div>
              </section>
            </div>
            <section className="lg:col-span-1">
              <h2 className="mb-2 text-lg font-bold">Project Gallery</h2>
              <div className="aspect-square min-h-[200px] rounded-lg bg-zinc-900 flex items-center justify-center text-zinc-500">
                Project gallery
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
