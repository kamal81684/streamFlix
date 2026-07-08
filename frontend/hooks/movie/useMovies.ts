import { useState, useEffect } from "react";
import { getPublicMovies, getLatestMovies, getSimilarMovies } from "@/services/movie.api";
import { Movie } from "@/types/movie.types";

export const useLatestMovies = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getLatestMovies();
        setMovies(res.data.movies);
      } catch {
        setMovies([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, []);

  return { movies, isLoading };
};

export const usePublicMovies = (params?: {
  page?: number;
  limit?: number;
  genre?: string;
  search?: string;
  sort?: string;
}) => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setIsLoading(true);
      try {
        const res = await getPublicMovies(params);
        setMovies(res.data.movies);
        setTotalPages(res.data.totalPages);
        setTotal(res.data.total);
      } catch {
        setMovies([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, [params?.page, params?.genre, params?.search, params?.sort, params?.limit]);

  return { movies, totalPages, total, isLoading };
};

export const useSimilarMovies = (id: string) => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetch = async () => {
      try {
        const res = await getSimilarMovies(id);
        setMovies(res.data.movies);
      } catch {
        setMovies([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, [id]);

  return { movies, isLoading };
};
