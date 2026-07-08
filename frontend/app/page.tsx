"use client";

import HeroBanner from "@/components/movie/HeroBanner";
import MovieRow from "@/components/movie/MovieRow";
import { useLatestMovies } from "@/hooks/movie/useMovies";

export default function Home() {
  const { movies: latestMovies, isLoading: latestLoading } = useLatestMovies();

  return (
    <div>
      <HeroBanner />
      <div className="mx-auto max-w-7xl space-y-10 px-4 py-10">
        <MovieRow
          title="Latest Movies"
          movies={latestMovies}
          isLoading={latestLoading}
        />
      </div>
    </div>
  );
}
