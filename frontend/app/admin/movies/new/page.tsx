"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import MovieForm from "@/components/admin/MovieForm";

export default function CreateMoviePage() {
  const { user } = useAuth();
  const router = useRouter();

  if (!user || user.role !== "admin") {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <Button onClick={() => router.push("/")}>Go Home</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Create Movie</h1>
      <MovieForm />
    </div>
  );
}
