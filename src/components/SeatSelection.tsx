import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface SeatSelectionProps {
  movieId: string;
  theaterId: string;
  showDate: string;
  showTime: string;
  maxSeats: number;
  onSeatsSelected: (seats: string[]) => void;
  onBack: () => void;
}

// Theater layout configuration
const ROWS = ["A", "B", "C", "D", "E", "F", "G", "H"];
const SEATS_PER_ROW = 12;

const SeatSelection = ({
  movieId,
  theaterId,
  showDate,
  showTime,
  maxSeats,
  onSeatsSelected,
  onBack,
}: SeatSelectionProps) => {
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [bookedSeats, setBookedSeats] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookedSeats();
  }, [movieId, theaterId, showDate, showTime]);

  const fetchBookedSeats = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("movie_showtimes" as never)
        .select("booked_seats")
        .eq("movie_id", movieId)
        .eq("theater_id", theaterId)
        .eq("show_date", showDate)
        .single();

      if (error) throw error;
      
      // Filter booked seats by showtime
      const allBookedSeats = (data as { booked_seats: string[] | null })?.booked_seats || [];
      // Parse seats that are booked for this specific showtime
      const timeBookedSeats = allBookedSeats.filter((seat: string) => 
        seat.startsWith(`${showTime}:`)
      ).map((seat: string) => seat.replace(`${showTime}:`, ""));
      
      setBookedSeats(timeBookedSeats);
    } catch (error) {
      console.error("Error fetching booked seats:", error);
      // Simulate some booked seats for demo
      const simulatedBooked = ["A3", "A4", "B5", "B6", "C7", "D2", "D3", "E8", "F1", "F2", "G10", "H5", "H6"];
      setBookedSeats(simulatedBooked);
    } finally {
      setLoading(false);
    }
  };

  const handleSeatClick = (seatId: string) => {
    if (bookedSeats.includes(seatId)) return;

    setSelectedSeats((prev) => {
      if (prev.includes(seatId)) {
        return prev.filter((s) => s !== seatId);
      }
      if (prev.length >= maxSeats) {
        // Replace the first selected seat
        return [...prev.slice(1), seatId];
      }
      return [...prev, seatId];
    });
  };

  const getSeatStatus = (seatId: string): "available" | "selected" | "booked" => {
    if (bookedSeats.includes(seatId)) return "booked";
    if (selectedSeats.includes(seatId)) return "selected";
    return "available";
  };

  const handleConfirm = () => {
    if (selectedSeats.length === maxSeats) {
      onSeatsSelected(selectedSeats);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 py-4">
        <Skeleton className="h-8 w-48 mx-auto" />
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Screen */}
      <div className="text-center mb-6">
        <div className="w-3/4 mx-auto h-2 bg-primary/60 rounded-t-full mb-2" />
        <p className="text-xs text-muted-foreground uppercase tracking-widest">Screen</p>
      </div>

      {/* Seat Grid */}
      <div className="overflow-x-auto pb-4">
        <div className="min-w-fit mx-auto">
          {ROWS.map((row) => (
            <div key={row} className="flex items-center justify-center gap-1 mb-1.5">
              <span className="w-6 text-xs font-medium text-muted-foreground text-right mr-2">
                {row}
              </span>
              <div className="flex gap-1">
                {Array.from({ length: SEATS_PER_ROW }, (_, i) => {
                  const seatNum = i + 1;
                  const seatId = `${row}${seatNum}`;
                  const status = getSeatStatus(seatId);

                  return (
                    <button
                      key={seatId}
                      onClick={() => handleSeatClick(seatId)}
                      disabled={status === "booked"}
                      className={cn(
                        "w-7 h-7 rounded-t-lg text-xs font-medium transition-all duration-200 flex items-center justify-center",
                        status === "booked" && "bg-muted text-muted-foreground cursor-not-allowed opacity-50",
                        status === "available" && "border-2 border-primary text-primary hover:bg-primary/10",
                        status === "selected" && "bg-primary text-primary-foreground border-2 border-primary"
                      )}
                      title={status === "booked" ? "Seat unavailable" : `Seat ${seatId}`}
                    >
                      {seatNum}
                    </button>
                  );
                })}
              </div>
              <span className="w-6 text-xs font-medium text-muted-foreground text-left ml-2">
                {row}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 py-4 border-t border-border">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-t-lg border-2 border-primary" />
          <span className="text-xs text-muted-foreground">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-t-lg bg-primary border-2 border-primary" />
          <span className="text-xs text-muted-foreground">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-t-lg bg-muted opacity-50" />
          <span className="text-xs text-muted-foreground">Unavailable</span>
        </div>
      </div>

      {/* Selection Info */}
      <div className="bg-secondary rounded-lg p-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              Selected: <span className="font-medium text-foreground">{selectedSeats.length}/{maxSeats}</span>
            </p>
            {selectedSeats.length > 0 && (
              <p className="text-sm font-medium text-primary mt-1">
                Seats: {selectedSeats.sort().join(", ")}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <Button variant="outline" onClick={onBack} className="flex-1">
          Back
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={selectedSeats.length !== maxSeats}
          className="flex-1"
        >
          {selectedSeats.length === maxSeats
            ? "Confirm Seats"
            : `Select ${maxSeats - selectedSeats.length} more`}
        </Button>
      </div>
    </div>
  );
};

export default SeatSelection;
