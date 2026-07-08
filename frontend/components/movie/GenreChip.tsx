"use client";

interface GenreChipProps {
  genre: string;
  isActive?: boolean;
  onClick?: () => void;
}

export default function GenreChip({ genre, isActive, onClick }: GenreChipProps) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
        isActive
          ? "bg-primary text-primary-foreground"
          : "bg-muted text-muted-foreground hover:bg-muted/80"
      }`}
    >
      {genre}
    </button>
  );
}
