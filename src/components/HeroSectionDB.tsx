import { Play, Info, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useMovies } from "@/hooks/useMovies";
import BookingModal from "./BookingModal";
import heroBanner from "@/assets/hero-banner.jpg";

const HeroSectionDB = () => {
  const { movies } = useMovies();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showBooking, setShowBooking] = useState(false);

  // Get first 3 movies for carousel
  const featuredMovies = movies.slice(0, 3);
  const currentMovie = featuredMovies[currentIndex] || null;

  // Auto-advance carousel
  useEffect(() => {
    if (featuredMovies.length === 0) return;
    
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredMovies.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [featuredMovies.length]);

  const goToNext = () => {
    if (featuredMovies.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % featuredMovies.length);
  };

  const goToPrev = () => {
    if (featuredMovies.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + featuredMovies.length) % featuredMovies.length);
  };

  if (featuredMovies.length === 0) {
    return (
      <section className="relative h-[60vh] md:h-[70vh] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroBanner}
            alt="Featured movies"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/30" />
        </div>
        <div className="relative container mx-auto px-4 h-full flex items-center">
          <div className="max-w-2xl animate-slide-in">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-3">
              Welcome to BookMyShow
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-6">
              Book tickets for the latest movies, events, and shows
            </p>
          </div>
        </div>
      </section>
    );
  }

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return "";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <>
      <section className="relative h-[60vh] md:h-[70vh] overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={currentMovie?.banner_url || currentMovie?.poster_url || heroBanner}
            alt={currentMovie?.title || "Featured"}
            className="w-full h-full object-cover transition-all duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/30" />
        </div>

        {/* Content */}
        <div className="relative container mx-auto px-4 h-full flex items-center">
          <div className="max-w-2xl animate-slide-in" key={currentMovie?.id}>
            {/* Rating & Duration */}
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <span className="px-2 py-0.5 text-xs font-semibold bg-primary text-primary-foreground rounded">
                {currentMovie?.certificate || "UA"}
              </span>
              <span className="text-sm text-muted-foreground">
                {formatDuration(currentMovie?.duration_minutes || 0)}
              </span>
              <div className="flex gap-2 flex-wrap">
                {currentMovie?.genres?.slice(0, 3).map((genre) => (
                  <span key={genre} className="text-sm text-muted-foreground">
                    {genre}
                  </span>
                ))}
              </div>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-3">
              {currentMovie?.title}
            </h1>

            {/* Description */}
            <p className="text-lg md:text-xl text-muted-foreground mb-6 line-clamp-2">
              {currentMovie?.description || "Experience the magic of cinema"}
            </p>

            {/* Buttons */}
            <div className="flex items-center gap-4">
              <Button size="lg" className="gap-2" onClick={() => setShowBooking(true)}>
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

      {currentMovie && (
        <BookingModal
          movieId={currentMovie.id}
          open={showBooking}
          onOpenChange={setShowBooking}
        />
      )}
    </>
  );
};

export default HeroSectionDB;
