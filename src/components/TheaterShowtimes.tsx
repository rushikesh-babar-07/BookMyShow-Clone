import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MapPin, ChevronLeft, ChevronRight, Calendar } from "lucide-react";
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
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [theaters, setTheaters] = useState<Theater[]>([]);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(0);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedShowtime, setSelectedShowtime] = useState<{
    theaterId: string;
    theaterName: string;
    time: string;
    date: string;
    price: number;
  } | null>(null);

  // Generate next 14 days for more scrolling options
  const availableDates = Array.from({ length: 14 }, (_, i) => {
    const date = addDays(new Date(), i);
    return {
      value: format(date, "yyyy-MM-dd"),
      dayName: format(date, "EEE"),
      dayNum: format(date, "d"),
      month: format(date, "MMM"),
      fullDate: format(date, "EEEE, MMMM d"),
      isToday: i === 0,
      isTomorrow: i === 1,
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
      const { data: theatersData, error: theatersError } = await supabase
        .from("theaters" as never)
        .select("*");

      if (theatersError) throw theatersError;

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

  const scrollDates = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const theatersWithShowtimes = theaters.filter((theater) => getShowtimeForTheater(theater.id));

  return (
    <>
      <Dialog open={open && !showBookingModal} onOpenChange={onOpenChange}>
        <DialogContent className="bg-card border-border max-w-3xl max-h-[90vh] overflow-hidden flex flex-col p-0">
          {/* Header */}
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
            <DialogTitle className="text-foreground text-xl font-bold">
              Theaters Showing {movieTitle}
            </DialogTitle>
          </DialogHeader>

          {/* Date Selection Section */}
          <div className="px-6 py-4 bg-secondary/30 border-b border-border">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Select Date</span>
            </div>
            
            {/* Horizontally Scrollable Date Row */}
            <div className="relative">
              {/* Left Scroll Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => scrollDates("left")}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 bg-card/90 hover:bg-card shadow-md rounded-full"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              {/* Scrollable Date Container */}
              <div
                ref={scrollContainerRef}
                className="flex gap-2 overflow-x-auto scrollbar-hide px-10 pb-1 scroll-smooth"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {availableDates.map((date, index) => (
                  <button
                    key={date.value}
                    onClick={() => setSelectedDate(index)}
                    className={`
                      flex flex-col items-center min-w-[72px] px-3 py-3 rounded-xl transition-all duration-200 shrink-0
                      ${selectedDate === index
                        ? "bg-primary text-primary-foreground shadow-lg scale-105"
                        : "bg-card text-foreground hover:bg-secondary border border-border hover:border-primary/50"
                      }
                    `}
                  >
                    <span className={`text-xs font-medium uppercase tracking-wide ${
                      selectedDate === index ? "text-primary-foreground/80" : "text-muted-foreground"
                    }`}>
                      {date.isToday ? "Today" : date.isTomorrow ? "Tomorrow" : date.dayName}
                    </span>
                    <span className="text-2xl font-bold my-0.5">{date.dayNum}</span>
                    <span className={`text-xs ${
                      selectedDate === index ? "text-primary-foreground/80" : "text-muted-foreground"
                    }`}>
                      {date.month}
                    </span>
                  </button>
                ))}
              </div>

              {/* Right Scroll Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => scrollDates("right")}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 bg-card/90 hover:bg-card shadow-md rounded-full"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Selected Date Display */}
            <p className="text-sm text-muted-foreground mt-3 text-center">
              Showing theaters for <span className="font-medium text-foreground">{availableDates[selectedDate].fullDate}</span>
            </p>
          </div>

          {/* Theaters & Showtimes Section */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {/* Section Header */}
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-medium text-foreground">
                Available Halls & Showtimes
              </h3>
              {!loading && (
                <Badge variant="secondary" className="ml-auto">
                  {theatersWithShowtimes.length} {theatersWithShowtimes.length === 1 ? "hall" : "halls"}
                </Badge>
              )}
            </div>

            {/* Theaters List */}
            <div className="space-y-4">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="bg-secondary/50 border-border">
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
              ) : theatersWithShowtimes.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto bg-secondary rounded-full flex items-center justify-center mb-4">
                    <Calendar className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">
                    No showtimes available for this date.
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Try selecting a different date.
                  </p>
                </div>
              ) : (
                theatersWithShowtimes.map((theater) => {
                  const showtime = getShowtimeForTheater(theater.id)!;

                  return (
                    <Card key={theater.id} className="bg-card border-border hover:border-primary/30 transition-colors">
                      <CardContent className="p-4">
                        {/* Theater Info */}
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h4 className="text-lg font-semibold text-foreground">
                              {theater.name}
                            </h4>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                              <MapPin className="h-3.5 w-3.5 shrink-0" />
                              <span>{theater.location}</span>
                              {theater.address && (
                                <>
                                  <span className="text-border">•</span>
                                  <span className="text-xs truncate max-w-[200px]">{theater.address}</span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-xl font-bold text-primary">₹{showtime.price}</span>
                            <p className="text-xs text-muted-foreground">per ticket</p>
                          </div>
                        </div>

                        {/* Amenities */}
                        {theater.amenities && theater.amenities.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {theater.amenities.map((amenity) => (
                              <Badge
                                key={amenity}
                                variant="outline"
                                className="text-xs text-muted-foreground border-border bg-secondary/50"
                              >
                                {amenity}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {/* Showtimes Grid */}
                        <div>
                          <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide font-medium">
                            Select Showtime
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {showtime.show_times.map((time) => (
                              <Button
                                key={time}
                                variant="outline"
                                size="sm"
                                onClick={() => handleTimeSelect(theater, time, showtime)}
                                className="border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-200 font-medium min-w-[80px]"
                              >
                                {time}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
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
