import api from "@/lib/axios";

export const getContinueWatching = async () => {
  return api.get("/movies/continue");
};

export const updateProgress = async (data: {
  movieId: string;
  lastPosition: number;
  duration: number;
  progress: number;
  completed?: boolean;
}) => {
  return api.post("/movies/progress", data);
};
