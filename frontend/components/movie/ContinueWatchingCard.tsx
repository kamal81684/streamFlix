import Link from "next/link";
import { WatchHistory } from "@/types/watch.types";
import CachedImage from "@/components/ui/CachedImage";

function formatRemaining(lastPosition: number, duration: number) {
  const remainingSec = Math.max(0, Math.round(duration - lastPosition));
  const mins = Math.floor(remainingSec / 60);
  if (mins <= 0) return "Less than a minute left";
  if (mins < 60) return `${mins} min left`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ${mins % 60}m left`;
}

export default function ContinueWatchingCard({ item }: { item: WatchHistory }) {
  const { movie, progress, lastPosition, duration } = item;
  const pct = Math.min(100, Math.max(2, progress));

  return (
    <Link
      href={`/watch/${movie._id}`}
      className="group block overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10 transition-all hover:ring-2 hover:ring-primary"
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

        {/* Play affordance on hover */}
        <span className="absolute inset-0 flex items-center justify-center bg-black/25 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 pl-1 text-lg text-black shadow-lg">
            ▶
          </span>
        </span>

        {/* Resume badge */}
        <span className="absolute left-2 top-2 rounded-md bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur">
          Resume
        </span>

        {/* Progress bar pinned to the bottom edge */}
        <span className="absolute inset-x-0 bottom-0 h-1 bg-white/25">
          <span
            className="block h-full bg-primary"
            style={{ width: `${pct}%` }}
          />
        </span>
      </div>

      <div className="space-y-1 p-3">
        <h3 className="truncate font-medium">{movie.title}</h3>
        <p className="text-xs text-muted-foreground">
          {duration > 0 ? formatRemaining(lastPosition, duration) : "In progress"}
        </p>
      </div>
    </Link>
  );
}
