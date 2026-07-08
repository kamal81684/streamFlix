"use client";

import { useState, useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import axios from "axios";
import {
  getAllMovies,
  publishMovie,
  unpublishMovie,
  featureMovie,
  unfeatureMovie,
} from "@/services/admin.api";
import { uploadThumbnailDirect, uploadVideoDirect } from "@/lib/upload";
import { Movie } from "@/types/movie.types";
import { Button } from "@/components/ui/button";

// A clickable preview tile that doubles as the upload / replace control.
function MediaCell({
  kind,
  accept,
  hasMedia,
  progress,
  preview,
  onFile,
}: {
  kind: string;
  accept: string;
  hasMedia: boolean;
  progress?: number;
  preview: ReactNode;
  onFile: (file: File) => void;
}) {
  const uploading = progress !== undefined;

  return (
    <label
      title={hasMedia ? `Replace ${kind}` : `Upload ${kind}`}
      className={`group relative flex h-14 w-24 items-center justify-center overflow-hidden rounded-md border bg-muted ${
        uploading ? "cursor-default" : "cursor-pointer"
      } ${hasMedia ? "border-border" : "border-dashed border-input"}`}
    >
      {hasMedia ? (
        preview
      ) : (
        <span className="text-[10px] font-medium text-muted-foreground">
          + {kind}
        </span>
      )}

      {!uploading && (
        <span className="absolute inset-0 flex items-center justify-center bg-black/55 text-[10px] font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100">
          {hasMedia ? "Replace" : "Upload"}
        </span>
      )}

      {uploading && (
        <span className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/70">
          <span className="text-[10px] font-semibold text-white">
            {progress}%
          </span>
          <span className="h-1 w-16 overflow-hidden rounded-full bg-white/25">
            <span
              className="block h-full rounded-full bg-white transition-all"
              style={{ width: `${progress}%` }}
            />
          </span>
        </span>
      )}

      <input
        type="file"
        accept={accept}
        className="hidden"
        disabled={uploading}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
          e.target.value = "";
        }}
      />
    </label>
  );
}

export default function MovieTable() {
  const router = useRouter();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // Upload progress keyed by `${movieId}:thumb` / `${movieId}:video`.
  // A value of undefined means "no upload in progress".
  const [progress, setProgress] = useState<Record<string, number>>({});

  const setProgressFor = (uploadKey: string, value?: number) =>
    setProgress((prev) => {
      if (value === undefined) {
        const next = { ...prev };
        delete next[uploadKey];
        return next;
      }
      return { ...prev, [uploadKey]: value };
    });

  const fetchMovies = async () => {
    try {
      const res = await getAllMovies();
      setMovies(res.data.movies);
    } catch {
      toast.error("Failed to load movies");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const handlePublish = async (id: string, isPublished: boolean) => {
    try {
      if (isPublished) {
        await unpublishMovie(id);
      } else {
        await publishMovie(id);
      }
      fetchMovies();
      toast.success(isPublished ? "Movie unpublished" : "Movie published");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        toast.error(error.response.data.message);
      }
    }
  };

  const handleFeature = async (id: string, isFeatured: boolean) => {
    try {
      if (isFeatured) {
        await unfeatureMovie(id);
      } else {
        await featureMovie(id);
      }
      fetchMovies();
      toast.success(isFeatured ? "Unfeatured" : "Featured");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        toast.error(error.response.data.message);
      }
    }
  };

  const handleUploadError = (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.data?.message) {
      toast.error(error.response.data.message);
    } else if (error instanceof Error) {
      toast.error(error.message);
    } else {
      toast.error("Upload failed");
    }
  };

  const handleThumbnailUpload = async (id: string, file: File) => {
    const key = `${id}:thumb`;
    setProgressFor(key, 0);
    try {
      await uploadThumbnailDirect(id, file, (p) => setProgressFor(key, p));
      fetchMovies();
      toast.success("Thumbnail uploaded");
    } catch (error) {
      handleUploadError(error);
    } finally {
      setProgressFor(key, undefined);
    }
  };

  const handleVideoUpload = async (id: string, file: File) => {
    const key = `${id}:video`;
    setProgressFor(key, 0);
    try {
      await uploadVideoDirect(id, file, (p) => setProgressFor(key, p));
      fetchMovies();
      toast.success("Video uploaded");
    } catch (error) {
      handleUploadError(error);
    } finally {
      setProgressFor(key, undefined);
    }
  };

  if (isLoading) {
    return <div className="animate-pulse text-center py-8 text-muted-foreground">Loading...</div>;
  }

  if (movies.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">No movies yet.</p>
        <Button onClick={() => router.push("/admin/movies/new")}>
          Create First Movie
        </Button>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-separate border-spacing-0 text-sm">
        <thead>
          <tr className="text-left text-[11px] uppercase tracking-wide text-muted-foreground">
            <th className="border-b py-2 pr-4 font-medium">Title</th>
            <th className="border-b py-2 pr-4 font-medium">Year</th>
            <th className="border-b py-2 pr-4 font-medium">Published</th>
            <th className="border-b py-2 pr-4 font-medium">Featured</th>
            <th className="border-b py-2 pr-4 font-medium">Thumbnail</th>
            <th className="border-b py-2 pr-4 font-medium">Video</th>
            <th className="border-b py-2 pr-4 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {movies.map((movie) => (
            <tr
              key={movie._id}
              className="align-middle transition-colors hover:bg-muted/40"
            >
              <td className="border-b py-3 pr-4 font-medium">{movie.title}</td>
              <td className="border-b py-3 pr-4 text-muted-foreground">
                {movie.releaseYear}
              </td>
              <td className="border-b py-3 pr-4">
                <Button
                  size="xs"
                  variant={movie.isPublished ? "default" : "outline"}
                  onClick={() => handlePublish(movie._id, movie.isPublished)}
                >
                  {movie.isPublished ? "Published" : "Draft"}
                </Button>
              </td>
              <td className="border-b py-3 pr-4">
                <Button
                  size="xs"
                  variant={movie.isFeatured ? "default" : "outline"}
                  onClick={() => handleFeature(movie._id, movie.isFeatured)}
                >
                  {movie.isFeatured ? "Featured" : "Not Featured"}
                </Button>
              </td>
              <td className="border-b py-3 pr-4">
                <MediaCell
                  kind="image"
                  accept="image/*"
                  hasMedia={!!movie.thumbnail?.url}
                  progress={progress[`${movie._id}:thumb`]}
                  onFile={(file) => handleThumbnailUpload(movie._id, file)}
                  preview={
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={movie.thumbnail?.url}
                      alt={movie.title}
                      className="h-full w-full object-cover"
                    />
                  }
                />
              </td>
              <td className="border-b py-3 pr-4">
                <MediaCell
                  kind="video"
                  accept="video/*"
                  hasMedia={!!movie.video?.url}
                  progress={progress[`${movie._id}:video`]}
                  onFile={(file) => handleVideoUpload(movie._id, file)}
                  preview={
                    <span className="relative block h-full w-full">
                      <video
                        src={movie.video?.url}
                        poster={movie.thumbnail?.url}
                        muted
                        playsInline
                        preload="metadata"
                        className="h-full w-full bg-black object-cover"
                      />
                      <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-black/60 pl-0.5 text-[8px] text-white">
                          ▶
                        </span>
                      </span>
                    </span>
                  }
                />
              </td>
              <td className="border-b py-3 pr-4">
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => router.push(`/admin/movies/${movie._id}/edit`)}
                >
                  Edit
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
