import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import { format, addDays } from "date-fns";
import BookingModal from "./BookingModal";

interface Theater {
  id: string;
  name: string;
  location: string;
  address: string | null;
  amenities: string[] | null;
}

interface Showtime {
  id: string;
  theater_id: string;
  show_date: string;
  show_times: string[];
  price: number;
  available_seats: number;
}

interface TheaterShowtimesProps {
  movieId: string;
  movieTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TheaterShowtimes = ({ movieId, movieTitle, open, onOpenChange }: TheaterShowtimesProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [theaters, setTheaters] = useState<Theater[]>([]);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(0); // Index of available dates
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedShowtime, setSelectedShowtime] = useState<{
    theaterId: string;
    theaterName: string;
    time: string;
    date: string;
    price: number;
  } | null>(null);

  // Generate next 7 days
  const availableDates = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(new Date(), i);
    return {
      value: format(date, "yyyy-MM-dd"),
      dayName: format(date, "EEE"),
      dayNum: format(date, "d"),
      month: format(date, "MMM"),
      isToday: i === 0,
    };
  });

  useEffect(() => {
    if (open) {
      fetchTheatersAndShowtimes();
    }
  }, [open, movieId, selectedDate]);

  const fetchTheatersAndShowtimes = async () => {
    setLoading(true);
    try {
      // Fetch theaters using raw SQL-like approach via RPC or direct table access
      const { data: theatersData, error: theatersError } = await supabase
        .from("theaters" as never)
        .select("*");

      if (theatersError) throw theatersError;

      // Fetch showtimes for selected date
      const selectedDateValue = availableDates[selectedDate].value;
      const { data: showtimesData, error: showtimesError } = await supabase
        .from("movie_showtimes" as never)
        .select("*")
        .eq("movie_id", movieId)
        .eq("show_date", selectedDateValue);

      if (showtimesError) throw showtimesError;

      setTheaters((theatersData as Theater[]) || []);
      setShowtimes((showtimesData as Showtime[]) || []);
    } catch (error) {
      console.error("Error fetching theaters:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTimeSelect = (theater: Theater, time: string, showtime: Showtime) => {
    if (!user) {
      onOpenChange(false);
      navigate("/login");
      return;
    }

    setSelectedShowtime({
      theaterId: theater.id,
      theaterName: theater.name,
      time,
      date: showtime.show_date,
      price: showtime.price,
    });
    setShowBookingModal(true);
  };

  const getShowtimeForTheater = (theaterId: string) => {
    return showtimes.find((s) => s.theater_id === theaterId);
  };

  return (
    <>
      <Dialog open={open && !showBookingModal} onOpenChange={onOpenChange}>
        <DialogContent className="bg-card border-border max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader className="pb-4 border-b border-border">
            <DialogTitle className="text-foreground text-xl">
              Theaters Showing {movieTitle}
            </DialogTitle>
          </DialogHeader>

          {/* Date Selector */}
          <div className="flex items-center gap-2 py-4 border-b border-border">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedDate(Math.max(0, selectedDate - 1))}
              disabled={selectedDate === 0}
              className="shrink-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex gap-2 overflow-x-auto flex-1 scrollbar-hide">
              {availableDates.map((date, index) => (
                <button
                  key={date.value}
                  onClick={() => setSelectedDate(index)}
                  className={`flex flex-col items-center min-w-[60px] px-3 py-2 rounded-lg transition-colors ${
                    selectedDate === index
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-foreground hover:bg-secondary/80"
                  }`}
                >
                  <span className="text-xs font-medium">{date.dayName}</span>
                  <span className="text-lg font-bold">{date.dayNum}</span>
                  <span className="text-xs">{date.month}</span>
                  {date.isToday && (
                    <span className="text-[10px] uppercase tracking-wider">Today</span>
                  )}
                </button>
              ))}
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedDate(Math.min(6, selectedDate + 1))}
              disabled={selectedDate === 6}
              className="shrink-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Theaters List */}
          <div className="flex-1 overflow-y-auto py-4 space-y-4">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="bg-secondary border-border">
                  <CardContent className="p-4">
                    <Skeleton className="h-6 w-48 mb-2" />
                    <Skeleton className="h-4 w-64 mb-4" />
                    <div className="flex gap-2">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Skeleton key={j} className="h-10 w-20" />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : theaters.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No theaters available for this movie.
              </div>
            ) : (
              theaters.map((theater) => {
                const showtime = getShowtimeForTheater(theater.id);
                
                if (!showtime) {
                  return null; // Skip theaters without showtimes for this date
                }

                return (
                  <Card key={theater.id} className="bg-secondary border-border">
                    <CardContent className="p-4">
                      {/* Theater Info */}
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">
                            {theater.name}
                          </h3>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                            <MapPin className="h-3.5 w-3.5" />
                            <span>{theater.location}</span>
                            {theater.address && (
                              <span className="text-xs">• {theater.address}</span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-bold text-primary">₹{showtime.price}</span>
                          <p className="text-xs text-muted-foreground">per ticket</p>
                        </div>
                      </div>

                      {/* Amenities */}
                      {theater.amenities && theater.amenities.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {theater.amenities.map((amenity) => (
                            <Badge
                              key={amenity}
                              variant="outline"
                              className="text-xs text-muted-foreground border-border"
                            >
                              {amenity}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Showtimes */}
                      <div className="flex flex-wrap gap-2">
                        {showtime.show_times.map((time) => (
                          <Button
                            key={time}
                            variant="outline"
                            size="sm"
                            onClick={() => handleTimeSelect(theater, time, showtime)}
                            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                          >
                            {time}
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Booking Modal */}
      {selectedShowtime && (
        <BookingModal
          movieId={movieId}
          open={showBookingModal}
          onOpenChange={(open) => {
            setShowBookingModal(open);
            if (!open) {
              setSelectedShowtime(null);
            }
          }}
          preselectedData={{
            theaterId: selectedShowtime.theaterId,
            theaterName: selectedShowtime.theaterName,
            date: selectedShowtime.date,
            time: selectedShowtime.time,
            price: selectedShowtime.price,
          }}
        />
      )}
    </>
  );
};

export default TheaterShowtimes;
