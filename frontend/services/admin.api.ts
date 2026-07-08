import api from "@/lib/axios";
import { CreateMovieData } from "@/types/movie.types";

export const getAllMovies = async () => {
  return api.get("/movies");
};

export const getMovieById = async (id: string) => {
  return api.get(`/movies/${id}`);
};

export const createMovie = async (data: CreateMovieData) => {
  return api.post("/movies", data);
};

export const publishMovie = async (id: string) => {
  return api.patch(`/movies/${id}/publish`);
};

export const unpublishMovie = async (id: string) => {
  return api.patch(`/movies/${id}/unpublish`);
};

export const featureMovie = async (id: string) => {
  return api.patch(`/movies/${id}/feature`);
};

export const unfeatureMovie = async (id: string) => {
  return api.patch(`/movies/${id}/unfeature`);
};

export const uploadThumbnail = async (id: string, file: File) => {
  const formData = new FormData();
  formData.append("thumbnail", file);
  return api.patch(`/movies/${id}/thumbnail`, formData);
};

export const uploadVideo = async (id: string, file: File) => {
  const formData = new FormData();
  formData.append("video", file);
  return api.patch(`/movies/${id}/video`, formData);
};
