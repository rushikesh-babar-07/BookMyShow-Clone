import { Star, Heart, Play } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import BookingModal from "./BookingModal";
import { Tables } from "@/integrations/supabase/types";

type Movie = Tables<"movies">;

interface MovieCardProps {
  movie: Movie;
}

const MovieCard = ({ movie }: MovieCardProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [showBooking, setShowBooking] = useState(false);

  const formatVotes = (votes: number | null) => {
    if (!votes) return "0";
    if (votes >= 1000) {
      return `${(votes / 1000).toFixed(1)}K`;
    }
    return votes.toString();
  };

  return (
    <>
      <div className="group relative flex flex-col animate-fade-in">
        {/* Poster Container */}
        <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-secondary">
          <img
            src={movie.poster_url || "/placeholder.svg"}
            alt={movie.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          
          {/* Overlay on Hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Like Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsLiked(!isLiked);
            }}
            className="absolute top-3 right-3 p-2 rounded-full bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-background"
          >
            <Heart
              className={`h-4 w-4 transition-colors ${
                isLiked ? "fill-primary text-primary" : "text-foreground"
              }`}
            />
          </button>

          {/* Book Now Button - Visible on Hover */}
          <div className="absolute inset-x-3 bottom-14 opacity-0 group-hover:opacity-100 transition-all duration-300">
            <Button 
              onClick={() => setShowBooking(true)}
              className="w-full gap-2"
              size="sm"
            >
              <Play className="h-4 w-4 fill-current" />
              Book Now
            </Button>
          </div>

          {/* Rating Badge */}
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2 py-1 rounded bg-background/90 backdrop-blur-sm">
            <Star className="h-3.5 w-3.5 fill-gold text-gold" />
            <span className="text-sm font-semibold text-foreground">{movie.rating}/10</span>
            <span className="text-xs text-muted-foreground">{formatVotes(movie.votes_count)} votes</span>
          </div>
        </div>

        {/* Movie Info */}
        <div className="mt-3 space-y-1.5">
          <h3 className="font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
            {movie.title}
          </h3>
          <div className="flex flex-wrap gap-1">
            {movie.genres?.slice(0, 2).map((genre) => (
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
            {movie.languages?.join(", ")}
          </p>
        </div>
      </div>

      <BookingModal
        movieId={movie.id}
        open={showBooking}
        onOpenChange={setShowBooking}
      />
    </>
  );
};

export default MovieCard;
