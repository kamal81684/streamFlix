"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import axios from "axios";
import {
  getAllMovies,
  publishMovie,
  unpublishMovie,
  featureMovie,
  unfeatureMovie,
  uploadThumbnail,
  uploadVideo,
} from "@/services/admin.api";
import { Movie } from "@/types/movie.types";
import { Button } from "@/components/ui/button";

export default function MovieTable() {
  const router = useRouter();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const handleThumbnailUpload = async (id: string, file: File) => {
    try {
      await uploadThumbnail(id, file);
      fetchMovies();
      toast.success("Thumbnail uploaded");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        toast.error(error.response.data.message);
      }
    }
  };

  const handleVideoUpload = async (id: string, file: File) => {
    try {
      await uploadVideo(id, file);
      toast.success("Video uploaded");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        toast.error(error.response.data.message);
      }
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
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-muted-foreground">
            <th className="py-2 pr-4">Title</th>
            <th className="py-2 pr-4">Year</th>
            <th className="py-2 pr-4">Published</th>
            <th className="py-2 pr-4">Featured</th>
            <th className="py-2 pr-4">Thumbnail</th>
            <th className="py-2 pr-4">Video</th>
            <th className="py-2 pr-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {movies.map((movie) => (
            <tr key={movie._id} className="border-b">
              <td className="py-2 pr-4 font-medium">{movie.title}</td>
              <td className="py-2 pr-4">{movie.releaseYear}</td>
              <td className="py-2 pr-4">
                <Button
                  size="xs"
                  variant={movie.isPublished ? "default" : "outline"}
                  onClick={() => handlePublish(movie._id, movie.isPublished)}
                >
                  {movie.isPublished ? "Published" : "Draft"}
                </Button>
              </td>
              <td className="py-2 pr-4">
                <Button
                  size="xs"
                  variant={movie.isFeatured ? "default" : "outline"}
                  onClick={() => handleFeature(movie._id, movie.isFeatured)}
                >
                  {movie.isFeatured ? "Featured" : "Not Featured"}
                </Button>
              </td>
              <td className="py-2 pr-4">
                <label className="cursor-pointer text-primary hover:underline text-xs">
                  Upload
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleThumbnailUpload(movie._id, file);
                    }}
                  />
                </label>
              </td>
              <td className="py-2 pr-4">
                <label className="cursor-pointer text-primary hover:underline text-xs">
                  Upload
                  <input
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleVideoUpload(movie._id, file);
                    }}
                  />
                </label>
              </td>
              <td className="py-2 pr-4">
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
