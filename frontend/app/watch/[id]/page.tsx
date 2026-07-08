"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { getPublicMovieById } from "@/services/movie.api";
import { Movie } from "@/types/movie.types";
import { Button } from "@/components/ui/button";

export default function WatchPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "");

  useEffect(() => {
    if (!id) return;
    const fetch = async () => {
      try {
        const res = await getPublicMovieById(id);
        setMovie(res.data.movie);
      } catch {
        setError("Movie not found");
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">{error || "Movie not found"}</h1>
        <Button onClick={() => router.push("/movies")}>Back to Browse</Button>
      </div>
    );
  }

  const videoUrl =
    movie.video?.url ||
    (movie.video?.key
      ? `${apiUrl}/movies/${movie._id}/video`
      : null);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="overflow-hidden rounded-xl bg-black">
        {videoUrl ? (
          <video
            ref={videoRef}
            src={videoUrl}
            controls
            className="aspect-video w-full"
            autoPlay
          >
            Your browser does not support the video tag.
          </video>
        ) : (
          <div className="flex aspect-video items-center justify-center text-muted-foreground">
            Video not available
          </div>
        )}
      </div>

      <div className="mt-4 space-y-2">
        <h1 className="text-2xl font-bold">{movie.title}</h1>
        <p className="text-sm text-muted-foreground">
          {movie.releaseYear} &middot; {movie.duration} min &middot;{" "}
          {movie.genre.join(", ")}
        </p>
        <p className="text-sm">{movie.description}</p>
      </div>
    </div>
  );
}
