"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getMovieById } from "@/services/admin.api";
import { Movie } from "@/types/movie.types";
import { Button } from "@/components/ui/button";

export default function EditMoviePage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id || !user) return;
    const fetch = async () => {
      try {
        const res = await getMovieById(id);
        setMovie(res.data.movie);
      } catch {
        setMovie(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, [id, user]);

  if (!user || user.role !== "admin") {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <Button onClick={() => router.push("/")}>Go Home</Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 animate-pulse">
        <div className="h-8 w-1/2 rounded bg-muted" />
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Movie not found</h1>
        <Button onClick={() => router.push("/admin/movies")}>Back</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Edit Movie</h1>
      <p className="text-muted-foreground">
        Edit functionality requires a PUT endpoint on the backend. 
        For now, you can manage this movie from the{" "}
        <button
          className="text-primary underline"
          onClick={() => router.push("/admin/movies")}
        >
          movie list
        </button>
        .
      </p>
    </div>
  );
}
