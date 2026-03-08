import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
      <main className="mx-auto max-w-2xl px-6 py-16 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Goose Collab</h1>
        <p className="mt-4 text-zinc-400">
          Find collaborators and build something together.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            href="/auth"
            className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 font-semibold"
          >
            🧪 Test Dashboard
          </Link>
          <Link
            href="/projects"
            className="rounded-lg bg-zinc-800 px-6 py-3 text-white hover:bg-zinc-700"
          >
            Browse Projects
          </Link>
          <Link
            href="/profile/demo"
            className="rounded-lg border border-zinc-700 px-6 py-3 text-zinc-300 hover:border-zinc-600 hover:text-white"
          >
            View Sample Profile
          </Link>
        </div>
      </main>
    </div>
  );
}
