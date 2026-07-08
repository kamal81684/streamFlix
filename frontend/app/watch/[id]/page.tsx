"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { getPublicMovieById } from "@/services/movie.api";
import { getMovieProgress, updateProgress } from "@/services/watch.api";
import { useAuth } from "@/context/AuthContext";
import { Movie } from "@/types/movie.types";
import { Button } from "@/components/ui/button";

function formatTime(sec: number) {
  if (!Number.isFinite(sec) || sec < 0) return "0:00";
  const s = Math.floor(sec % 60);
  const m = Math.floor((sec / 60) % 60);
  const h = Math.floor(sec / 3600);
  const mm = h > 0 ? String(m).padStart(2, "0") : String(m);
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

export default function WatchPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);

  // Resume bookkeeping. resumeAtRef holds a pending seek target that may arrive
  // before OR after the video's metadata loads, so we apply it from whichever
  // fires last. lastSavedRef throttles redundant progress writes.
  const resumeAtRef = useRef<number | null>(null);
  const resumeAppliedRef = useRef(false);
  const lastSavedRef = useRef(0);

  // Full API base, e.g. http://localhost:5001/api — the stream route is
  // mounted under /api, so we must NOT strip it.
  const apiBase = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    if (!id) return;
    const fetchMovie = async () => {
      try {
        const res = await getPublicMovieById(id);
        setMovie(res.data.movie);
      } catch {
        setError("Movie not found");
      } finally {
        setIsLoading(false);
      }
    };
    fetchMovie();
  }, [id]);

  // Seek to the staged resume point once both the target and metadata exist.
  const applyResume = useCallback(() => {
    const v = videoRef.current;
    const at = resumeAtRef.current;
    if (!v || at == null || resumeAppliedRef.current) return;
    if (v.readyState < 1) return; // metadata not ready yet; onLoadedMetadata retries
    resumeAppliedRef.current = true;
    v.currentTime = at;
    lastSavedRef.current = at;
    toast.info(`Resuming from ${formatTime(at)}`);
  }, []);

  // Pull saved position for logged-in viewers and stage it for resume.
  useEffect(() => {
    if (!id || !user) return;
    const fetchProgress = async () => {
      try {
        const res = await getMovieProgress(id);
        const h = res.data.history;
        if (
          h &&
          !h.completed &&
          h.lastPosition > 5 &&
          (!h.duration || h.lastPosition < h.duration - 10)
        ) {
          resumeAtRef.current = h.lastPosition;
          applyResume();
        }
      } catch {
        // no saved progress — start from the beginning
      }
    };
    fetchProgress();
  }, [id, user, applyResume]);

  const saveProgress = useCallback(
    async (completed = false) => {
      const v = videoRef.current;
      if (!v || !user || !movie) return;
      const lastPosition = v.currentTime;
      const duration = v.duration;
      if (!Number.isFinite(duration) || duration <= 0) return;
      // Skip near-identical saves unless we're flushing a completion.
      if (!completed && Math.abs(lastPosition - lastSavedRef.current) < 3) return;
      lastSavedRef.current = lastPosition;
      const progress = Math.min(100, Math.round((lastPosition / duration) * 100));
      try {
        await updateProgress({
          movieId: movie._id,
          lastPosition,
          duration,
          progress,
          completed: completed || progress >= 95,
        });
      } catch {
        // best-effort; will retry on the next tick
      }
    },
    [user, movie]
  );

  // Periodic + lifecycle progress saves while watching.
  useEffect(() => {
    if (!user || !movie) return;
    const interval = setInterval(() => saveProgress(), 10000);
    const onHidden = () => {
      if (document.visibilityState === "hidden") saveProgress();
    };
    document.addEventListener("visibilitychange", onHidden);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onHidden);
      saveProgress(); // flush on unmount / navigation away
    };
  }, [user, movie, saveProgress]);

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">{error || "Movie not found"}</h1>
        <Button onClick={() => router.push("/movies")}>Back to Browse</Button>
      </div>
    );
  }

  // Stream through the backend proxy for playback. Unlike a presigned S3 URL
  // (which expires after ~1h and would 403 mid-movie or on pause/resume), this
  // never expires and doesn't depend on a freshly-signed url reaching the client.
  const videoUrl = movie.video?.key
    ? `${apiBase}/movies/${movie._id}/video`
    : movie.video?.url || null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <button
        onClick={() => router.back()}
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <span aria-hidden>←</span> Back
      </button>

      <div className="overflow-hidden rounded-xl bg-black shadow-xl ring-1 ring-white/10">
        {videoUrl ? (
          <video
            ref={videoRef}
            src={videoUrl}
            controls
            className="aspect-video w-full"
            autoPlay
            onLoadedMetadata={applyResume}
            onPause={() => saveProgress()}
            onEnded={() => saveProgress(true)}
          >
            Your browser does not support the video tag.
          </video>
        ) : (
          <div className="flex aspect-video items-center justify-center text-muted-foreground">
            Video not available
          </div>
        )}
      </div>

      <div className="mt-5 space-y-3">
        <h1 className="text-2xl font-bold">{movie.title}</h1>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-md border border-input px-1.5 py-0.5 font-medium text-muted-foreground">
            {movie.maturityRating}
          </span>
          <span className="text-muted-foreground">{movie.releaseYear}</span>
          <span className="text-muted-foreground">&middot;</span>
          <span className="text-muted-foreground">{movie.duration} min</span>
          {movie.genre.slice(0, 3).map((g) => (
            <span
              key={g}
              className="rounded-md bg-muted px-1.5 py-0.5 text-muted-foreground"
            >
              {g}
            </span>
          ))}
        </div>

        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
          {movie.description}
        </p>
      </div>
    </div>
  );
}
