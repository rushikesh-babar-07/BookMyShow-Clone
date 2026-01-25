export interface Movie {
  id: number;
  title: string;
  poster: string;
  rating: number;
  votes: string;
  genres: string[];
  languages: string[];
}

export const movies: Movie[] = [
  {
    id: 1,
    title: "Pushpa 2: The Rule",
    poster: "https://res.cloudinary.com/dyscn3fdd/image/upload/v1769324272/Pushpa_2_o7jj0c.jpg",
    rating: 8.6,
    votes: "245.5K",
    genres: ["Action", "Drama"],
    languages: ["Telugu", "Hindi", "Tamil"],
  },
  {
    id: 2,
    title: "Mufasa: The Lion King",
    poster: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&h=600&fit=crop",
    rating: 8.2,
    votes: "89.3K",
    genres: ["Animation", "Adventure"],
    languages: ["English", "Hindi"],
  },
  {
    id: 3,
    title: "Baby John",
    poster: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400&h=600&fit=crop",
    rating: 7.8,
    votes: "56.2K",
    genres: ["Action", "Thriller"],
    languages: ["Hindi"],
  },
  {
    id: 4,
    title: "Marco",
    poster: "https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=400&h=600&fit=crop",
    rating: 9.1,
    votes: "124.8K",
    genres: ["Action", "Crime"],
    languages: ["Malayalam", "Hindi"],
  },
  {
    id: 5,
    title: "Vanvaas",
    poster: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=400&h=600&fit=crop",
    rating: 7.5,
    votes: "23.4K",
    genres: ["Drama", "Family"],
    languages: ["Hindi"],
  },
  {
    id: 6,
    title: "UI",
    poster: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&h=600&fit=crop",
    rating: 8.0,
    votes: "67.1K",
    genres: ["Sci-Fi", "Thriller"],
    languages: ["Kannada", "Hindi"],
  },
  {
    id: 7,
    title: "Max",
    poster: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=400&h=600&fit=crop",
    rating: 7.9,
    votes: "45.6K",
    genres: ["Action", "Drama"],
    languages: ["Kannada"],
  },
  {
    id: 8,
    title: "Identity",
    poster: "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=400&h=600&fit=crop",
    rating: 8.4,
    votes: "98.2K",
    genres: ["Thriller", "Mystery"],
    languages: ["Malayalam", "Hindi"],
  },
];

export const genres = [
  "All",
  "Action",
  "Comedy",
  "Drama",
  "Horror",
  "Thriller",
  "Romance",
  "Sci-Fi",
  "Animation",
];
