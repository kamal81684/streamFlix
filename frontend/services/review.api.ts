import api from "@/lib/axios";

export const getMovieReviews = async (movieId: string) => {
  return api.get(`/movies/${movieId}/reviews`);
};

export const createReview = async (data: {
  movieId: string;
  rating: number;
  comment: string;
}) => {
  return api.post("/reviews", data);
};
