"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [search, setSearch] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/movies?search=${encodeURIComponent(search.trim())}`);
    }
  };

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4">
        <Link href="/" className="text-lg font-bold">
          StreamFlix
        </Link>

        <form onSubmit={handleSearch} className="hidden sm:flex flex-1 max-w-sm">
          <input
            type="text"
            placeholder="Search movies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring"
          />
        </form>

        <div className="flex items-center gap-2 ml-auto">
          {user ? (
            <>
              <Button variant="ghost" size="sm" onClick={() => router.push("/movies")}>
                Browse
              </Button>
              {user.role === "admin" && (
                <Button variant="ghost" size="sm" onClick={() => router.push("/admin/movies")}>
                  Admin
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={() => router.push(user.role === "admin" ? "/role/admin" : "/role/user")}>
                {user.name}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={async () => {
                  await logout();
                  router.push("/auth/login");
                }}
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => router.push("/auth/login")}>
                Login
              </Button>
              <Button size="sm" onClick={() => router.push("/auth/register")}>
                Register
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
