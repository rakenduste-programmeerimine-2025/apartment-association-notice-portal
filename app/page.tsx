import Link from "next/link";
import { House } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col bg-gray-900">
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <House size={48} className="text-white mb-6" />

        <h1 className="text-4xl font-bold text-white">
          Welcome to the Apartment Association Notice Portal
        </h1>

        <p className="text-white mt-4 mb-6">
          Log in or sign up to continue
        </p>

        <Link href="/auth/login">
          <button className="px-6 py-3 bg-white text-gray-900 font-semibold rounded-md hover:bg-gray-200">
            Log in / Sign up
          </button>
        </Link>
      </div>
    </main>
  );
}
