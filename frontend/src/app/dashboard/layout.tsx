"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components";
import { useAuth } from "@/context/AuthContext";

const navItems = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/competitors", label: "Competitors" },
  { href: "/dashboard/analysis", label: "Analysis" },
  { href: "/dashboard/strategies", label: "Strategies" },
  { href: "/dashboard/landscape", label: "Landscape" },
  { href: "/dashboard/generate", label: "Generate Copy" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex">
        <aside className="w-64 bg-dark-card border-r border-dark-border p-6 flex flex-col">
          <Link href="/" className="block mb-8">
            <h1 className="text-2xl font-bold">
              <span className="text-primary-green">Ad</span>
              <span className="text-primary-blue">Cipher</span>
            </h1>
          </Link>
          <nav className="flex flex-col gap-2 flex-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 rounded-lg transition-all ${
                  pathname === item.href
                    ? "bg-primary-blue text-white"
                    : "text-white hover:bg-dark-cardHover"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="border-t border-dark-border pt-4 mt-4">
            <p className="text-muted text-sm mb-2 truncate">{user?.email}</p>
            <button
              onClick={handleSignOut}
              className="text-white hover:text-red-400 text-sm transition-all"
            >
              Sign Out
            </button>
          </div>
        </aside>
        <main className="flex-1 p-8">{children}</main>
      </div>
    </ProtectedRoute>
  );
}
