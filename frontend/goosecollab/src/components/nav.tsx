"use client";

import { getCurrentUser } from "@/lib/api";
import Link from "next/link";
import { useEffect, useState } from "react";

export function Nav() {
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  useEffect(() => {
    getCurrentUser()
      .then((user) => setCurrentUser(user.uid))
      .catch(() => setCurrentUser(null));
  }, []);

  return (
    <nav className="flex gap-4 border-b border-zinc-800 px-6 py-4">
      <Link href="/" className="text-zinc-300 hover:text-white">
        Home
      </Link>
      <Link href="/projects" className="text-zinc-300 hover:text-white">
        Projects
      </Link>
      {currentUser && (
        <Link href={`/profile/${currentUser}`} className="text-zinc-300 hover:text-white">
          Profile
        </Link>
      )}
    </nav>
  );
}