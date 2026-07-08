export interface Movie {
  _id: string;
  title: string;
  description: string;
  thumbnail: {
    key: string;
    url: string;
  };
  genre: string[];
  language: string;
  isFeatured: boolean;
  duration: number;
  releaseYear: number;
  director: string;
  cast: string[];
  maturityRating: "U" | "U/A 7+" | "U/A 13+" | "U/A 16+" | "A";
  tags: string[];
  isPublished: boolean;
  createdBy: { _id: string; name: string; email: string };
  slug: string;
  video: {
    key: string;
    url: string;
    duration: number;
    size: number;
    mimeType: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PublicMoviesResponse {
  success: boolean;
  movies: Movie[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateMovieData {
  title: string;
  description: string;
  genre: string[];
  language: string;
  duration: number;
  releaseYear: number;
  director: string;
  cast: string[];
  maturityRating?: string;
  tags?: string[];
}
