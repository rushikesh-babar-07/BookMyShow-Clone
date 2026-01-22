import { useState } from "react";
import MovieCard from "./MovieCard";
import { movies, genres } from "@/data/movies";
import { Button } from "@/components/ui/button";

const MovieListings = () => {
  const [selectedGenre, setSelectedGenre] = useState("All");

  const filteredMovies = selectedGenre === "All"
    ? movies
    : movies.filter((movie) =>
        movie.genres.some((g) => g.toLowerCase() === selectedGenre.toLowerCase())
      );

  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              Now Showing
            </h2>
            <p className="text-muted-foreground mt-1">
              Book tickets for the latest movies in your city
            </p>
          </div>

          {/* Genre Filter */}
          <div className="flex flex-wrap gap-2">
            {genres.map((genre) => (
              <Button
                key={genre}
                variant={selectedGenre === genre ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedGenre(genre)}
                className={
                  selectedGenre === genre
                    ? ""
                    : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/50"
                }
              >
                {genre}
              </Button>
            ))}
          </div>
        </div>

        {/* Movies Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
          {filteredMovies.map((movie, index) => (
            <div
              key={movie.id}
              style={{ animationDelay: `${index * 0.05}s` }}
              className="opacity-0 animate-fade-in"
            >
              <MovieCard
                title={movie.title}
                poster={movie.poster}
                rating={movie.rating}
                votes={movie.votes}
                genres={movie.genres}
                languages={movie.languages}
              />
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="flex justify-center mt-10">
          <Button variant="outline" size="lg" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
            See All Movies
          </Button>
        </div>
      </div>
    </section>
  );
};

export default MovieListings;
