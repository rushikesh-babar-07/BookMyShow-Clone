import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMovie } from "@/hooks/useMovies";
import { useBooking } from "@/hooks/useBooking";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Star, Clock, MapPin, CreditCard, Loader2, Check } from "lucide-react";
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
  const { createBooking, processPayment, loading } = useBooking();
  const navigate = useNavigate();

  const [step, setStep] = useState<"select" | "seats" | "confirm" | "payment" | "success">("select");
  const [selectedSeatCount, setSelectedSeatCount] = useState("1");
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  const [bookingId, setBookingId] = useState<string | null>(null);

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
    setSelectedSeatIds(seats);
    setStep("confirm");
  };

  const handleCreateBooking = async () => {
    if (!movie || !preselectedData) return;

    const booking = await createBooking({
      movieId: movie.id,
      movieTitle: movie.title,
      seats: parseInt(selectedSeatCount),
      showDate: preselectedData.date,
      showTime: preselectedData.time,
      totalAmount,
      seatIds: selectedSeatIds,
    });

    if (booking) {
      setBookingId(booking.id);
      setStep("payment");
    }
  };

  const handlePayment = async () => {
    if (!bookingId || !movie) return;

    const result = await processPayment(bookingId, movie.title);
    if (result.success) {
      setStep("success");
    }
  };

  const handleClose = () => {
    setStep("select");
    setSelectedSeatCount("1");
    setSelectedSeatIds([]);
    setBookingId(null);
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

        {step === "confirm" && preselectedData && (
          <>
            <DialogHeader>
              <DialogTitle className="text-foreground">Confirm Booking</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Review your booking details
              </DialogDescription>
            </DialogHeader>

            <Card className="bg-secondary border-border">
              <CardContent className="pt-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Movie</span>
                  <span className="text-foreground font-medium">{movie.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Theater</span>
                  <span className="text-foreground">{preselectedData.theaterName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date</span>
                  <span className="text-foreground">{format(new Date(preselectedData.date), "EEE, MMM d, yyyy")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time</span>
                  <span className="text-foreground">{preselectedData.time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Seats</span>
                  <span className="text-foreground font-medium text-primary">
                    {selectedSeatIds.sort().join(", ")}
                  </span>
                </div>
                <div className="flex justify-between pt-3 border-t border-border">
                  <span className="text-foreground font-medium">Total</span>
                  <span className="text-foreground font-bold">₹{totalAmount}</span>
                </div>
              </CardContent>
            </Card>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setStep("seats")} className="flex-1">
                Back
              </Button>
              <Button onClick={handleCreateBooking} disabled={loading} className="flex-1">
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Confirm Booking
              </Button>
            </DialogFooter>
          </>
        )}

        {step === "payment" && (
          <>
            <DialogHeader>
              <DialogTitle className="text-foreground">Payment</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Complete your payment to confirm booking
              </DialogDescription>
            </DialogHeader>

            <div className="py-6 text-center">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <CreditCard className="h-8 w-8 text-primary" />
              </div>
              <p className="text-2xl font-bold text-foreground mb-2">₹{totalAmount}</p>
              <p className="text-sm text-muted-foreground mb-2">
                Seats: <span className="font-medium text-primary">{selectedSeatIds.sort().join(", ")}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Click below to simulate payment processing
              </p>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setStep("confirm")} className="flex-1" disabled={loading}>
                Back
              </Button>
              <Button onClick={handlePayment} disabled={loading} className="flex-1">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  "Pay Now"
                )}
              </Button>
            </DialogFooter>
          </>
        )}

        {step === "success" && (
          <>
            <DialogHeader>
              <DialogTitle className="text-foreground">Booking Confirmed!</DialogTitle>
            </DialogHeader>

            <div className="py-6 text-center">
              <div className="w-16 h-16 mx-auto bg-primary/20 rounded-full flex items-center justify-center mb-4">
                <Check className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Thank you for your booking!
              </h3>
              <p className="text-sm text-muted-foreground mb-2">
                Your tickets for {movie.title} have been booked successfully.
              </p>
              <p className="text-sm font-medium text-primary">
                Seats: {selectedSeatIds.sort().join(", ")}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Check your email for confirmation.
              </p>
            </div>

            <DialogFooter>
              <Button onClick={handleClose} className="w-full">
                Done
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;
