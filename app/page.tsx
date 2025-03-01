import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold">Welcome to Globetrotter</h1>
      <p className="mt-4">Test your knowledge and explore destinations!</p>
      <Link href="/play">
        <button className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Start Playing
        </button>
      </Link>
    </main>
  );
}
