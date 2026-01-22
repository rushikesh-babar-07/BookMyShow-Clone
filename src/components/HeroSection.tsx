import { Play, Info, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import heroBanner from "@/assets/hero-banner.jpg";

interface FeaturedMovie {
  id: number;
  title: string;
  tagline: string;
  rating: string;
  duration: string;
  genres: string[];
  image: string;
}

const featuredMovies: FeaturedMovie[] = [
  {
    id: 1,
    title: "Pushpa 2: The Rule",
    tagline: "The fire rises again",
    rating: "UA",
    duration: "3h 21m",
    genres: ["Action", "Drama", "Thriller"],
    image: heroBanner,
  },
  {
    id: 2,
    title: "Mufasa: The Lion King",
    tagline: "The story of an orphan who would become king",
    rating: "U",
    duration: "1h 58m",
    genres: ["Animation", "Adventure", "Drama"],
    image: heroBanner,
  },
  {
    id: 3,
    title: "Baby John",
    tagline: "Action packed thriller",
    rating: "UA",
    duration: "2h 41m",
    genres: ["Action", "Thriller"],
    image: heroBanner,
  },
];

const HeroSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentMovie = featuredMovies[currentIndex];

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % featuredMovies.length);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + featuredMovies.length) % featuredMovies.length);
  };

  return (
    <section className="relative h-[60vh] md:h-[70vh] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={currentMovie.image}
          alt={currentMovie.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/30" />
      </div>

      {/* Content */}
      <div className="relative container mx-auto px-4 h-full flex items-center">
        <div className="max-w-2xl animate-slide-in">
          {/* Rating & Duration */}
          <div className="flex items-center gap-3 mb-4">
            <span className="px-2 py-0.5 text-xs font-semibold bg-primary text-primary-foreground rounded">
              {currentMovie.rating}
            </span>
            <span className="text-sm text-muted-foreground">{currentMovie.duration}</span>
            <div className="flex gap-2">
              {currentMovie.genres.map((genre) => (
                <span key={genre} className="text-sm text-muted-foreground">
                  {genre}
                </span>
              ))}
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-3">
            {currentMovie.title}
          </h1>

          {/* Tagline */}
          <p className="text-lg md:text-xl text-muted-foreground mb-6">
            {currentMovie.tagline}
          </p>

          {/* Buttons */}
          <div className="flex items-center gap-4">
            <Button size="lg" className="gap-2">
              <Play className="h-5 w-5 fill-current" />
              Book Tickets
            </Button>
            <Button size="lg" variant="outline" className="gap-2 border-foreground/20 hover:bg-foreground/10">
              <Info className="h-5 w-5" />
              More Info
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <div className="absolute bottom-1/2 translate-y-1/2 left-4 right-4 flex justify-between pointer-events-none">
        <button
          onClick={goToPrev}
          className="p-2 rounded-full bg-background/50 backdrop-blur-sm text-foreground hover:bg-background/80 transition-colors pointer-events-auto"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          onClick={goToNext}
          className="p-2 rounded-full bg-background/50 backdrop-blur-sm text-foreground hover:bg-background/80 transition-colors pointer-events-auto"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      {/* Dots Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {featuredMovies.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? "w-8 bg-primary"
                : "bg-foreground/30 hover:bg-foreground/50"
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSection;
