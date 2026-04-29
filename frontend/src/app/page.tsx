"use client";

import Link from "next/link";
import { Button } from "@/components";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const { user, loading } = useAuth();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="text-center max-w-2xl">
        <h1 className="text-5xl font-bold mb-4">
          <span className="text-primary-green">Ad</span>
          <span className="text-primary-blue">Cipher</span>
        </h1>
        <p className="text-xl mb-8 text-white">
          Decode competitor ads. Discover gaps. Generate winning strategies.
        </p>
        <div className="flex gap-4 justify-center">
          {loading ? (
            <div className="text-white">Loading...</div>
          ) : user ? (
            <Link href="/dashboard">
              <Button variant="blue">Go to Dashboard</Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="blue">Sign In</Button>
              </Link>
              <Link href="/signup">
                <Button variant="green">Get Started</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
