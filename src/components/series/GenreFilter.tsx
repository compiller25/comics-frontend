import { GENRES, Genre } from '@/lib/types';

interface GenreFilterProps {
  selectedGenre: string | null;
  onSelectGenre: (genre: string | null) => void;
}

export default function GenreFilter({ selectedGenre, onSelectGenre }: GenreFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onSelectGenre(null)}
        className={`genre-tag ${
          selectedGenre === null ? 'bg-primary text-primary-foreground' : ''
        }`}
      >
        All
      </button>
      {GENRES.map((genre) => (
        <button
          key={genre.value}
          onClick={() => onSelectGenre(genre.value)}
          className={`genre-tag ${
            selectedGenre === genre.value ? 'bg-primary text-primary-foreground' : ''
          }`}
        >
          {genre.emoji} {genre.label}
        </button>
      ))}
    </div>
  );
}
