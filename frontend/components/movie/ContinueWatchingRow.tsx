"use client";

import { useContinueWatching } from "@/hooks/movie/useContinueWatching";
import ContinueWatchingCard from "./ContinueWatchingCard";

export default function ContinueWatchingRow() {
  const { items, isLoading } = useContinueWatching();

  // Render nothing until we know there's something to resume — keeps the row
  // from flashing an empty header for logged-out or first-time viewers.
  if (isLoading || items.length === 0) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-baseline justify-between">
        <h2 className="text-2xl font-bold">Continue Watching</h2>
        <span className="text-xs text-muted-foreground">
          {items.length} {items.length === 1 ? "title" : "titles"}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {items.map((item) => (
          <ContinueWatchingCard key={item._id} item={item} />
        ))}
      </div>
    </section>
  );
}
