"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { useState } from "react";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const RATING = 3.4;

export default function Home() {
  const [selectedDays, setSelectedDays] = useState<Set<string>>(new Set());

  const handleClick = (day: string) => {
    setSelectedDays((prev) => {
      const next = new Set(prev);
      if (next.has(day)) next.delete(day);
      else next.add(day);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="mx-auto flex max-w-6xl gap-0 py-12 px-8">
        {/* Left column - Profile */}
        <aside className="flex w-72 shrink-0 flex-col items-start border-r border-zinc-800 pr-8">
          <div className="relative mb-4">
            <Avatar className="size-28 border-2 border-zinc-700">
              <AvatarImage src="" alt="Girish M" />
              <AvatarFallback className="bg-zinc-800 text-zinc-400 text-2xl">
                GM
              </AvatarFallback>
            </Avatar>
          </div>
          <h1 className="text-xl font-bold tracking-tight">Girish M</h1>
          <p className="mb-4 text-sm text-zinc-400">
            Software Engineering &apos;30
          </p>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              className="bg-zinc-800 text-white hover:bg-zinc-700"
            >
              LinkedIn
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="bg-zinc-800 text-white hover:bg-zinc-700"
            >
              GitHub
            </Button>
          </div>
          <Button
            variant="secondary"
            className="mt-3 w-full bg-zinc-700 text-white hover:bg-zinc-600"
          >
            View Resume
          </Button>
          <div className="mt-4 flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((i) => {
              const fill = Math.min(1, Math.max(0, RATING - (i - 1)));
              return (
                <div
                  key={i}
                  className="relative size-5 shrink-0"
                  aria-hidden="true"
                >
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
          <p className="mt-1 text-xs text-zinc-500">
            3.4/5 stars from 34 ratings
          </p>
        </aside>

        {/* Right column - Content */}
        <div className="flex-1 space-y-6 pl-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              <section>
                <h2 className="mb-2 text-lg font-bold">Bio</h2>
                <div className="min-h-[80px] rounded-lg bg-zinc-900 px-4 py-3 text-zinc-500">
                  Girish is gay
                </div>
              </section>
              <section>
                <h2 className="mb-2 text-lg font-bold">
                  Project Description
                </h2>
                <div className="min-h-[80px] rounded-lg bg-zinc-900 px-4 py-3 text-zinc-500">
                  Girish is closeted
                </div>
              </section>
              <section>
                <h2 className="mb-2 text-lg font-bold">Technical Skills</h2>
                <div className="min-h-[44px] rounded-lg bg-zinc-900 px-4 py-3 text-zinc-500">
                  Gooning
                </div>
              </section>
              <section>
                <h2 className="mb-2 text-lg font-bold">Availability</h2>
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
                What do I do here?
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
