import { useState, useEffect } from "react";
import { getGenres } from "@/services/movie.api";

export const useGenres = () => {
  const [genres, setGenres] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getGenres();
        setGenres(res.data.genres);
      } catch {
        setGenres([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, []);

  return { genres, isLoading };
};
