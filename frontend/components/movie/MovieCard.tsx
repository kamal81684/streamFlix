import Link from "next/link";
import { Movie } from "@/types/movie.types";

interface MovieCardProps {
  movie: Movie;
}

export default function MovieCard({ movie }: MovieCardProps) {
  return (
    <Link
      href={`/movies/${movie._id}`}
      className="group block overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10 transition-all hover:ring-2 hover:ring-primary"
    >
      <div className="aspect-video overflow-hidden bg-muted">
        {movie.thumbnail?.url ? (
          <img
            src={movie.thumbnail.url}
            alt={movie.title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            No Thumbnail
          </div>
        )}
      </div>
      <div className="space-y-1 p-3">
        <h3 className="font-medium truncate">{movie.title}</h3>
        <p className="text-xs text-muted-foreground">
          {movie.releaseYear} &middot; {movie.duration} min &middot;{" "}
          {movie.maturityRating}
        </p>
        <div className="flex flex-wrap gap-1">
          {movie.genre.slice(0, 2).map((g) => (
            <span
              key={g}
              className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
            >
              {g}
            </span>
          ))}
          {movie.genre.length > 2 && (
            <span className="text-[10px] text-muted-foreground">
              +{movie.genre.length - 2}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
