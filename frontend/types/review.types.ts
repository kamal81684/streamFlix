export interface Review {
  _id: string;
  user: { _id: string; name: string; avatar?: string };
  movie: string;
  rating: number;
  comment: string;
  createdAt: string;
}
