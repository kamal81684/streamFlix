import Link from "next/link";
import { Movie } from "@/types/movie.types";
import CachedImage from "@/components/ui/CachedImage";

interface MovieCardProps {
  movie: Movie;
}

export default function MovieCard({ movie }: MovieCardProps) {
  return (
    <Link
      href={`/movies/${movie._id}`}
      className="group block overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:ring-2 hover:ring-primary"
    >
      <div className="relative aspect-video overflow-hidden bg-muted">
        {movie.thumbnail?.url ? (
          <CachedImage
            cacheKey={movie.thumbnail.key}
            src={movie.thumbnail.url}
            alt={movie.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            No Thumbnail
          </div>
        )}

        {/* Hover play affordance */}
        <span className="absolute inset-0 flex items-center justify-center bg-black/25 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 pl-1 text-lg text-black shadow-lg">
            ▶
          </span>
        </span>

        {/* Maturity rating badge */}
        <span className="absolute right-2 top-2 rounded-md bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur">
          {movie.maturityRating}
        </span>
      </div>

      <div className="space-y-1 p-3">
        <h3 className="truncate font-medium transition-colors group-hover:text-primary">
          {movie.title}
        </h3>
        <p className="text-xs text-muted-foreground">
          {movie.releaseYear} &middot; {movie.duration} min
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
