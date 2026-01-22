import { Search, MapPin, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xl">B</span>
            </div>
            <span className="text-xl font-bold text-foreground hidden sm:block">
              BookMyShow
            </span>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex items-center flex-1 max-w-xl mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search for Movies, Events, Plays, Sports and Activities"
                className="pl-10 bg-secondary border-border focus:ring-primary"
              />
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {/* Location */}
            <button className="hidden sm:flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="text-sm">Mumbai</span>
            </button>

            {/* Sign In Button */}
            <Button size="sm" className="hidden sm:flex">
              Sign In
            </Button>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-foreground"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-6 pb-3 text-sm">
          <a href="#" className="text-foreground font-medium hover:text-primary transition-colors">
            Movies
          </a>
          <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
            Stream
          </a>
          <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
            Events
          </a>
          <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
            Plays
          </a>
          <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
            Sports
          </a>
          <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
            Activities
          </a>
        </nav>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                className="pl-10 bg-secondary"
              />
            </div>
            <nav className="flex flex-col gap-3">
              <a href="#" className="text-foreground font-medium py-2">Movies</a>
              <a href="#" className="text-muted-foreground py-2">Stream</a>
              <a href="#" className="text-muted-foreground py-2">Events</a>
              <a href="#" className="text-muted-foreground py-2">Plays</a>
              <a href="#" className="text-muted-foreground py-2">Sports</a>
              <a href="#" className="text-muted-foreground py-2">Activities</a>
            </nav>
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border">
              <button className="flex items-center gap-1 text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-sm">Mumbai</span>
              </button>
              <Button size="sm">Sign In</Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
