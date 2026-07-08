import api from "@/lib/axios";

export const getFeaturedMovie = async () => {
  return api.get("/movies/featured");
};

export const getLatestMovies = async () => {
  return api.get("/movies/latest");
};

export const getGenres = async () => {
  return api.get("/movies/genres");
};

export const getPublicMovies = async (params?: {
  page?: number;
  limit?: number;
  genre?: string;
  search?: string;
  sort?: string;
}) => {
  return api.get("/movies/public", { params });
};

export const getPublicMovieById = async (id: string) => {
  return api.get(`/movies/public/${id}`);
};

export const getMovieById = async (id: string) => {
  return api.get(`/movies/${id}`);
};

export const getSimilarMovies = async (id: string) => {
  return api.get(`/movies/${id}/similar`);
};
