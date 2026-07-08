"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import MovieCard from "@/components/movie/MovieCard";
import { usePublicMovies } from "@/hooks/movie/useMovies";
import { useGenres } from "@/hooks/movie/useGenres";
import GenreChip from "@/components/movie/GenreChip";
import { Button } from "@/components/ui/button";

function MoviesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [genre, setGenre] = useState(searchParams.get("genre") || "");
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [sort, setSort] = useState("latest");

  const { movies, totalPages, total, isLoading } = usePublicMovies({
    page,
    limit: 12,
    genre: genre || undefined,
    search: search || undefined,
    sort,
  });

  const { genres } = useGenres();

  useEffect(() => {
    const s = searchParams.get("search");
    if (s) setSearch(s);
  }, [searchParams]);

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8">
      <h1 className="text-3xl font-bold">Browse Movies</h1>

      <div className="flex flex-wrap items-center gap-2">
        <GenreChip
          genre="All"
          isActive={!genre}
          onClick={() => { setGenre(""); setPage(1); }}
        />
        {genres.map((g) => (
          <GenreChip
            key={g}
            genre={g}
            isActive={genre === g}
            onClick={() => { setGenre(g); setPage(1); }}
          />
        ))}
      </div>

      <div className="flex items-center gap-4">
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="h-8 rounded-lg border border-input bg-transparent px-2 text-sm outline-none"
        >
          <option value="latest">Latest</option>
          <option value="oldest">Oldest</option>
          <option value="title">Title</option>
        </select>
        {search && (
          <p className="text-sm text-muted-foreground">
            Results for &quot;{search}&quot;
          </p>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse space-y-2">
              <div className="aspect-video rounded-xl bg-muted" />
              <div className="h-4 w-3/4 rounded bg-muted" />
              <div className="h-3 w-1/2 rounded bg-muted" />
            </div>
          ))}
        </div>
      ) : movies.length === 0 ? (
        <p className="text-muted-foreground">No movies found.</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {movies.map((movie) => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>

          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

export default function MoviesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading...</div>}>
      <MoviesContent />
    </Suspense>
  );
}
