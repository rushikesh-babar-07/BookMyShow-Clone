import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMovie } from "@/hooks/useMovies";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Star, Clock, MapPin, Loader2 } from "lucide-react";
import { format } from "date-fns";
import SeatSelection from "./SeatSelection";

interface PreselectedData {
  theaterId: string;
  theaterName: string;
  date: string;
  time: string;
  price: number;
}

interface BookingModalProps {
  movieId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preselectedData?: PreselectedData;
}

const BookingModal = ({ movieId, open, onOpenChange, preselectedData }: BookingModalProps) => {
  const { movie, loading: movieLoading } = useMovie(movieId);
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<"select" | "seats">("select");
  const [selectedSeatCount, setSelectedSeatCount] = useState("1");

  const price = preselectedData?.price || movie?.price || 250;
  const totalAmount = price * parseInt(selectedSeatCount);

  const handleProceedToSeats = () => {
    if (!user) {
      onOpenChange(false);
      navigate("/login");
      return;
    }
    setStep("seats");
  };

  const handleSeatsSelected = (seats: string[]) => {
    if (!movie || !preselectedData) return;
    
    // Close modal and navigate to payment page
    onOpenChange(false);
    navigate("/payment", {
      state: {
        movieId: movie.id,
        movieTitle: movie.title,
        moviePoster: movie.poster_url,
        theaterId: preselectedData.theaterId,
        theaterName: preselectedData.theaterName,
        date: preselectedData.date,
        time: preselectedData.time,
        seats: seats,
        seatCount: parseInt(selectedSeatCount),
        pricePerSeat: price,
        totalAmount: totalAmount,
      },
    });
  };

  const handleClose = () => {
    setStep("select");
    setSelectedSeatCount("1");
    onOpenChange(false);
  };

  if (movieLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-card border-border">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!movie) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className={`bg-card border-border ${step === "seats" ? "max-w-2xl" : "max-w-md"}`}>
        {step === "select" && (
          <>
            <DialogHeader>
              <DialogTitle className="text-foreground">How Many Seats?</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                {movie.title}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Movie Info */}
              <div className="flex gap-4">
                <img
                  src={movie.poster_url || "/placeholder.svg"}
                  alt={movie.title}
                  className="w-20 h-28 object-cover rounded"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{movie.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <Star className="h-3.5 w-3.5 fill-gold text-gold" />
                    <span>{movie.rating}/10</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{movie.duration_minutes} mins</span>
                  </div>
                </div>
              </div>

              {/* Selected Theater & Time Info */}
              {preselectedData && (
                <Card className="bg-secondary border-border">
                  <CardContent className="p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span className="font-medium text-foreground">{preselectedData.theaterName}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{format(new Date(preselectedData.date), "EEE, MMM d, yyyy")}</span>
                      <span className="font-medium text-foreground">{preselectedData.time}</span>
                    </div>
                    <div className="text-sm text-primary font-medium">
                      ₹{preselectedData.price}/ticket
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Seats Selection */}
              <div className="space-y-2">
                <Label className="text-foreground">Number of Tickets</Label>
                <Select value={selectedSeatCount} onValueChange={setSelectedSeatCount}>
                  <SelectTrigger className="bg-secondary border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} {num === 1 ? "ticket" : "tickets"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center pt-4 border-t border-border">
                <span className="text-muted-foreground">Total Amount:</span>
                <span className="text-xl font-bold text-foreground">₹{totalAmount}</span>
              </div>
            </div>

            <DialogFooter>
              <Button onClick={handleProceedToSeats} className="w-full">
                {user ? "Select Seats" : "Sign in to Book"}
              </Button>
            </DialogFooter>
          </>
        )}

        {step === "seats" && preselectedData && (
          <>
            <DialogHeader>
              <DialogTitle className="text-foreground">Select Your Seats</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                {preselectedData.theaterName} • {preselectedData.time}
              </DialogDescription>
            </DialogHeader>

            <SeatSelection
              movieId={movieId}
              theaterId={preselectedData.theaterId}
              showDate={preselectedData.date}
              showTime={preselectedData.time}
              maxSeats={parseInt(selectedSeatCount)}
              onSeatsSelected={handleSeatsSelected}
              onBack={() => setStep("select")}
            />
          </>
        )}

      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;
