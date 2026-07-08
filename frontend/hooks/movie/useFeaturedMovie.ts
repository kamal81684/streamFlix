import { useState, useEffect } from "react";
import { getFeaturedMovie } from "@/services/movie.api";
import { Movie } from "@/types/movie.types";

export const useFeaturedMovie = () => {
  const [data, setData] = useState<Movie | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getFeaturedMovie();
        setData(res.data.movie);
      } catch {
        setData(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, []);

  return { data, isLoading };
};
