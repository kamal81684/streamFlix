import { Movie } from "./movie.types";

export interface WatchHistory {
  _id: string;
  user: string;
  movie: Movie;
  lastPosition: number;
  duration: number;
  progress: number;
  completed: boolean;
  watchedAt: string;
}
