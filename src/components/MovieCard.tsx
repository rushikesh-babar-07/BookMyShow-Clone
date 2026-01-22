import { Star, Heart } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

interface MovieCardProps {
  title: string;
  poster: string;
  rating: number;
  votes: string;
  genres: string[];
  languages: string[];
}

const MovieCard = ({ title, poster, rating, votes, genres, languages }: MovieCardProps) => {
  const [isLiked, setIsLiked] = useState(false);

  return (
    <div className="group relative flex flex-col animate-fade-in">
      {/* Poster Container */}
      <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-secondary">
        <img
          src={poster}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        
        {/* Overlay on Hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Like Button */}
        <button
          onClick={() => setIsLiked(!isLiked)}
          className="absolute top-3 right-3 p-2 rounded-full bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-background"
        >
          <Heart
            className={`h-4 w-4 transition-colors ${
              isLiked ? "fill-primary text-primary" : "text-foreground"
            }`}
          />
        </button>

        {/* Rating Badge */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2 py-1 rounded bg-background/90 backdrop-blur-sm">
          <Star className="h-3.5 w-3.5 fill-gold text-gold" />
          <span className="text-sm font-semibold text-foreground">{rating}/10</span>
          <span className="text-xs text-muted-foreground">{votes} votes</span>
        </div>
      </div>

      {/* Movie Info */}
      <div className="mt-3 space-y-1.5">
        <h3 className="font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
          {title}
        </h3>
        <div className="flex flex-wrap gap-1">
          {genres.slice(0, 2).map((genre) => (
            <Badge
              key={genre}
              variant="secondary"
              className="text-xs px-2 py-0.5 bg-secondary text-muted-foreground"
            >
              {genre}
            </Badge>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          {languages.join(", ")}
        </p>
      </div>
    </div>
  );
};

export default MovieCard;
