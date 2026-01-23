import { Search, MapPin, Menu, X, User, LogOut, Ticket } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xl">B</span>
            </div>
            <span className="text-xl font-bold text-foreground hidden sm:block">BookMyShow</span>
          </Link>

          <div className="hidden md:flex items-center flex-1 max-w-xl mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search for Movies, Events, Plays..." className="pl-10 bg-secondary border-border" />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="hidden sm:flex items-center gap-1 text-muted-foreground hover:text-foreground">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="text-sm">Mumbai</span>
            </button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">Account</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => navigate("/my-bookings")}>
                    <Ticket className="h-4 w-4 mr-2" />My Bookings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" />Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button size="sm" onClick={() => navigate("/login")} className="hidden sm:flex">Sign In</Button>
            )}

            <button className="md:hidden p-2 text-foreground" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-6 pb-3 text-sm">
          <Link to="/" className="text-foreground font-medium hover:text-primary">Movies</Link>
          <a href="#" className="text-muted-foreground hover:text-foreground">Events</a>
          <a href="#" className="text-muted-foreground hover:text-foreground">Plays</a>
          <a href="#" className="text-muted-foreground hover:text-foreground">Sports</a>
        </nav>

        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in">
            <nav className="flex flex-col gap-3">
              <Link to="/" className="text-foreground font-medium py-2" onClick={() => setIsMenuOpen(false)}>Movies</Link>
              {user && <Link to="/my-bookings" className="text-muted-foreground py-2" onClick={() => setIsMenuOpen(false)}>My Bookings</Link>}
            </nav>
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border">
              {user ? (
                <Button size="sm" variant="outline" onClick={handleSignOut}>Sign Out</Button>
              ) : (
                <Button size="sm" onClick={() => { navigate("/login"); setIsMenuOpen(false); }}>Sign In</Button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
