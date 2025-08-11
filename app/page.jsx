import Link from "next/link";

export default function Home() {
  return (
    <main className="p-4">
      <h1 className="text-3xl font-bold">Welcome to PrepAI 🚀</h1>
      <Link
        href="/dashboard"
        className="mt-4 inline-block bg-black text-white px-4 py-2 rounded"
      >
        Go to Dashboard
      </Link>
    </main>
  );
}