import { useState } from "react";
import MovieCard from "./MovieCardDB";
import { Button } from "@/components/ui/button";
import { useMovies } from "@/hooks/useMovies";
import { Loader2 } from "lucide-react";

const genres = [
  "All",
  "Action",
  "Comedy",
  "Drama",
  "Horror",
  "Thriller",
  "Romance",
  "Sci-Fi",
  "Animation",
  "Crime",
  "Adventure",
  "Mystery",
  "Family",
];

const MovieListingsDB = () => {
  const [selectedGenre, setSelectedGenre] = useState("All");
  const { movies, loading, error } = useMovies();

  const filteredMovies = selectedGenre === "All"
    ? movies
    : movies.filter((movie) =>
        movie.genres?.some((g) => g.toLowerCase() === selectedGenre.toLowerCase())
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
            {genres.slice(0, 9).map((genre) => (
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

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-lg text-center">
            {error}
          </div>
        )}

        {/* Movies Grid */}
        {!loading && !error && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
              {filteredMovies.map((movie, index) => (
                <div
                  key={movie.id}
                  style={{ animationDelay: `${index * 0.05}s` }}
                  className="opacity-0 animate-fade-in"
                >
                  <MovieCard movie={movie} />
                </div>
              ))}
            </div>

            {filteredMovies.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                No movies found for this genre.
              </div>
            )}

            {/* View All Button */}
            {filteredMovies.length > 0 && (
              <div className="flex justify-center mt-10">
                <Button variant="outline" size="lg" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                  See All Movies
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default MovieListingsDB;
