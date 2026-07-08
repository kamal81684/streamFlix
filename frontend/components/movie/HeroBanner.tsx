"use client";
// HMR trigger: small comment

import { useRouter } from "next/navigation";
import { useFeaturedMovie } from "@/hooks/movie/useFeaturedMovie";
import { Button } from "@/components/ui/button";
import CachedImage from "@/components/ui/CachedImage";

export default function HeroBanner() {
  const { data: movie, isLoading } = useFeaturedMovie();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="relative flex h-[50vh] items-center justify-center bg-muted animate-pulse">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!movie) return null;

  return (
    <section className="relative flex h-[50vh] items-end overflow-hidden">
      {movie.thumbnail?.url ? (
        <CachedImage
          cacheKey={movie.thumbnail.key}
          src={movie.thumbnail.url}
          alt={movie.title}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-gray-700" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
      <div className="relative z-10 max-w-2xl space-y-3 p-6">
        <h1 className="text-4xl font-bold text-white">{movie.title}</h1>
        <p className="text-sm text-gray-200">
          {movie.releaseYear} &middot; {movie.duration} min &middot;{" "}
          {movie.genre.join(", ")}
        </p>
        <p className="line-clamp-2 text-sm text-gray-300">
          {movie.description}
        </p>
        <div className="flex gap-3">
          <Button onClick={() => router.push(`/watch/${movie._id}`)}>
            Watch Now
          </Button>
          <Button variant="outline" onClick={() => router.push(`/movies/${movie._id}`)}>
            Details
          </Button>
        </div>
      </div>
    </section>
  );
}
