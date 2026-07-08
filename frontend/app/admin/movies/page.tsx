"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import MovieTable from "@/components/admin/MovieTable";

export default function AdminMoviesPage() {
  const { user } = useAuth();
  const router = useRouter();

  if (!user || user.role !== "admin") {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground">Admin access required.</p>
        <Button onClick={() => router.push("/")}>Go Home</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Movie Management</h1>
        <Button onClick={() => router.push("/admin/movies/new")}>
          Create Movie
        </Button>
      </div>
      <MovieTable />
    </div>
  );
}
