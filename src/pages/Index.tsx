import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import MovieListings from "@/components/MovieListings";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <MovieListings />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
