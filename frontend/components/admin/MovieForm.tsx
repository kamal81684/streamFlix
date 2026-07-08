"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import axios from "axios";
import { useRouter } from "next/navigation";
import { createMovie } from "@/services/admin.api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const movieSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters").max(200),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(2000),
  genre: z.string().min(1, "Enter genres separated by commas"),
  language: z.string().min(1, "Language is required"),
  duration: z.string().min(1, "Duration is required"),
  releaseYear: z.string().min(1, "Release year is required"),
  director: z.string().min(1, "Director is required"),
  cast: z.string().min(1, "Enter cast separated by commas"),
  maturityRating: z.string().optional(),
  tags: z.string().optional(),
});

type MovieFormData = z.infer<typeof movieSchema>;

interface MovieFormProps {
  defaultValues?: Partial<MovieFormData>;
}

export default function MovieForm({ defaultValues }: MovieFormProps) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<MovieFormData>({
    resolver: zodResolver(movieSchema),
    defaultValues,
  });

  const onSubmit = async (data: MovieFormData) => {
    try {
      const payload = {
        ...data,
        duration: parseInt(data.duration),
        releaseYear: parseInt(data.releaseYear),
        genre: data.genre.split(",").map((g) => g.trim()),
        cast: data.cast.split(",").map((c) => c.trim()),
        tags: data.tags
          ? data.tags.split(",").map((t) => t.trim())
          : undefined,
        maturityRating: data.maturityRating || undefined,
      };
      await createMovie(payload);
      toast.success("Movie created successfully");
      router.push("/admin/movies");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Something went wrong");
      }
    }
  };

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <CardTitle>Create Movie</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input id="title" {...register("title")} />
            {errors.title && (
              <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              rows={4}
              className="h-20 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring"
              {...register("description")}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="genre">Genres (comma separated)</Label>
              <Input id="genre" placeholder="Action, Drama" {...register("genre")} />
              {errors.genre && (
                <p className="mt-1 text-sm text-red-500">{errors.genre.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="language">Language</Label>
              <Input id="language" {...register("language")} />
              {errors.language && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.language.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input id="duration" type="number" {...register("duration")} />
              {errors.duration && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.duration.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="releaseYear">Release Year</Label>
              <Input id="releaseYear" type="number" {...register("releaseYear")} />
              {errors.releaseYear && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.releaseYear.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="director">Director</Label>
            <Input id="director" {...register("director")} />
            {errors.director && (
              <p className="mt-1 text-sm text-red-500">
                {errors.director.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="cast">Cast (comma separated)</Label>
            <Input id="cast" placeholder="Actor 1, Actor 2" {...register("cast")} />
            {errors.cast && (
              <p className="mt-1 text-sm text-red-500">{errors.cast.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="maturityRating">Maturity Rating</Label>
              <select
                id="maturityRating"
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2 text-sm outline-none"
                {...register("maturityRating")}
              >
                <option value="">Select</option>
                <option value="U">U</option>
                <option value="U/A 7+">U/A 7+</option>
                <option value="U/A 13+">U/A 13+</option>
                <option value="U/A 16+">U/A 16+</option>
                <option value="A">A</option>
              </select>
            </div>
            <div>
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input id="tags" placeholder="optional" {...register("tags")} />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Movie"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
