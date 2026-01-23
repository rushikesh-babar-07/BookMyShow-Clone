import Header from "@/components/Header";
import HeroSectionDB from "@/components/HeroSectionDB";
import MovieListingsDB from "@/components/MovieListingsDB";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSectionDB />
        <MovieListingsDB />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
