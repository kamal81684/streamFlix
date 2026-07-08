"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getPublicMovieById } from "@/services/movie.api";
import { Movie } from "@/types/movie.types";
import { Button } from "@/components/ui/button";
import MovieRow from "@/components/movie/MovieRow";
import { useSimilarMovies } from "@/hooks/movie/useMovies";
import CachedImage from "@/components/ui/CachedImage";

export default function MovieDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { movies: similarMovies, isLoading: similarLoading } = useSimilarMovies(id);

  useEffect(() => {
    if (!id) return;
    const fetch = async () => {
      try {
        const res = await getPublicMovieById(id);
        setMovie(res.data.movie);
      } catch {
        setMovie(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, [id]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl animate-pulse space-y-6 px-4 py-8">
        <div className="aspect-video rounded-xl bg-muted" />
        <div className="h-8 w-1/2 rounded bg-muted" />
        <div className="h-4 w-3/4 rounded bg-muted" />
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 text-center">
        <h1 className="text-2xl font-bold">Movie not found</h1>
        <Button className="mt-4" onClick={() => router.push("/movies")}>
          Back to Browse
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
        {movie.thumbnail?.url ? (
          <CachedImage
            cacheKey={movie.thumbnail.key}
            src={movie.thumbnail.url}
            alt={movie.title}
            className="aspect-video w-full object-cover"
          />
        ) : (
          <div className="flex aspect-video items-center justify-center bg-muted text-muted-foreground">
            No Thumbnail
          </div>
        )}
        <div className="space-y-4 p-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold">{movie.title}</h1>
              <p className="text-sm text-muted-foreground">
                {movie.releaseYear} &middot; {movie.duration} min &middot;{" "}
                {movie.maturityRating}
              </p>
            </div>
            <Button onClick={() => router.push(`/watch/${movie._id}`)}>
              Watch Now
            </Button>
          </div>

          <p className="text-sm leading-relaxed">{movie.description}</p>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Director: </span>
              {movie.director}
            </div>
            <div>
              <span className="font-medium">Language: </span>
              {movie.language}
            </div>
            <div>
              <span className="font-medium">Cast: </span>
              {movie.cast.join(", ")}
            </div>
            <div>
              <span className="font-medium">Genres: </span>
              {movie.genre.join(", ")}
            </div>
            {movie.tags && movie.tags.length > 0 && (
              <div className="col-span-2">
                <span className="font-medium">Tags: </span>
                {movie.tags.join(", ")}
              </div>
            )}
          </div>
        </div>
      </div>

      {similarMovies.length > 0 && (
        <div className="mt-10">
          <MovieRow
            title="Similar Movies"
            movies={similarMovies}
            isLoading={similarLoading}
          />
        </div>
      )}
    </div>
  );
}
