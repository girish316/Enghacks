import Link from "next/link";

export function Nav() {
  return (
    <nav className="flex gap-4 border-b border-zinc-800 px-6 py-4">
      <Link href="/" className="text-zinc-300 hover:text-white">
        Home
      </Link>
      <Link href="/projects" className="text-zinc-300 hover:text-white">
        Projects
      </Link>
      <Link href="/profile/demo" className="text-zinc-300 hover:text-white">
        Profile
      </Link>
    </nav>
  );
}
