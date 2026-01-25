import { useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Check, Download, Home, Ticket, MapPin, Calendar, Clock, Armchair, CreditCard, Smartphone } from "lucide-react";
import { format } from "date-fns";

interface ConfirmationState {
  movieId: string;
  movieTitle: string;
  moviePoster: string;
  theaterId: string;
  theaterName: string;
  date: string;
  time: string;
  seats: string[];
  seatCount: number;
  pricePerSeat: number;
  totalAmount: number;
  bookingId: string;
  paymentId: string;
  paymentMethod: "debit" | "credit" | "upi";
}

const BookingConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  
  const confirmationData = location.state as ConfirmationState | null;

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
    if (!confirmationData) {
      navigate("/");
    }
  }, [user, authLoading, confirmationData, navigate]);

  if (!confirmationData) {
    return null;
  }

  const getPaymentMethodLabel = () => {
    switch (confirmationData.paymentMethod) {
      case "upi":
        return "UPI";
      case "debit":
        return "Debit Card";
      case "credit":
        return "Credit Card";
    }
  };

  const getPaymentIcon = () => {
    if (confirmationData.paymentMethod === "upi") {
      return <Smartphone className="h-4 w-4" />;
    }
    return <CreditCard className="h-4 w-4" />;
  };

  const handleDownloadReceipt = () => {
    // Create a simple receipt text
    const receipt = `
╔════════════════════════════════════════════════╗
║            BOOKING CONFIRMATION                ║
╠════════════════════════════════════════════════╣
║                                                ║
║  Movie: ${confirmationData.movieTitle.padEnd(38)}║
║  Theater: ${confirmationData.theaterName.padEnd(36)}║
║  Date: ${format(new Date(confirmationData.date), "EEE, MMM d, yyyy").padEnd(39)}║
║  Time: ${confirmationData.time.padEnd(39)}║
║  Seats: ${confirmationData.seats.sort().join(", ").padEnd(38)}║
║                                                ║
╠════════════════════════════════════════════════╣
║  Booking ID: ${confirmationData.bookingId.slice(0, 8).padEnd(32)}║
║  Payment ID: ${confirmationData.paymentId.slice(0, 20).padEnd(32)}║
║  Amount Paid: ₹${confirmationData.totalAmount.toString().padEnd(30)}║
╠════════════════════════════════════════════════╣
║                                                ║
║       Thank you for booking with us!           ║
║                                                ║
╚════════════════════════════════════════════════╝
    `;

    const blob = new Blob([receipt], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `booking-${confirmationData.bookingId.slice(0, 8)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto bg-primary/20 rounded-full flex items-center justify-center mb-4">
              <Check className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Booking Confirmed!</h1>
            <p className="text-muted-foreground">
              Your tickets have been booked successfully. Check your email for confirmation.
            </p>
          </div>

          {/* Booking Receipt */}
          <Card className="bg-card border-border overflow-hidden">
            {/* Ticket Header */}
            <div className="bg-primary/10 p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Ticket className="h-5 w-5 text-primary" />
                  <span className="font-semibold text-foreground">E-Ticket</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  Booking ID: {confirmationData.bookingId.slice(0, 8).toUpperCase()}
                </span>
              </div>
            </div>

            <CardContent className="p-6 space-y-6">
              {/* Movie Info */}
              <div className="flex gap-4">
                <img
                  src={confirmationData.moviePoster || "/placeholder.svg"}
                  alt={confirmationData.movieTitle}
                  className="w-24 h-36 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-foreground mb-3">
                    {confirmationData.movieTitle}
                  </h2>
                  
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span className="text-sm text-foreground">{confirmationData.theaterName}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary shrink-0" />
                      <span className="text-sm text-foreground">
                        {format(new Date(confirmationData.date), "EEEE, MMMM d, yyyy")}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary shrink-0" />
                      <span className="text-sm text-foreground">{confirmationData.time}</span>
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="bg-border" />

              {/* Seats */}
              <div className="flex items-start gap-3">
                <Armchair className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Seats</p>
                  <p className="font-semibold text-lg text-primary">
                    {confirmationData.seats.sort().join(", ")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {confirmationData.seatCount} {confirmationData.seatCount === 1 ? "Ticket" : "Tickets"}
                  </p>
                </div>
              </div>

              <Separator className="bg-border" />

              {/* Payment Details */}
              <div className="space-y-3">
                <h3 className="font-semibold text-foreground">Payment Details</h3>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Payment Method</p>
                    <p className="font-medium text-foreground flex items-center gap-2 mt-1">
                      {getPaymentIcon()}
                      {getPaymentMethodLabel()}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Payment ID</p>
                    <p className="font-medium text-foreground mt-1">{confirmationData.paymentId}</p>
                  </div>
                </div>

                <div className="bg-secondary rounded-lg p-4 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Tickets ({confirmationData.seatCount} x ₹{confirmationData.pricePerSeat})</span>
                    <span className="text-foreground">₹{confirmationData.seatCount * confirmationData.pricePerSeat}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-muted-foreground">Convenience Fee</span>
                    <span className="text-foreground">₹{Math.round(confirmationData.totalAmount * 0.05)}</span>
                  </div>
                  <Separator className="my-3 bg-border" />
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-foreground">Total Paid</span>
                    <span className="text-xl font-bold text-primary">₹{confirmationData.totalAmount}</span>
                  </div>
                </div>
              </div>

              {/* Dashed Line */}
              <div className="border-t-2 border-dashed border-border" />

              {/* QR Code Placeholder */}
              <div className="text-center">
                <div className="w-32 h-32 mx-auto bg-secondary rounded-lg flex items-center justify-center mb-2">
                  <div className="grid grid-cols-4 gap-1">
                    {Array.from({ length: 16 }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-5 h-5 rounded-sm ${
                          Math.random() > 0.5 ? "bg-foreground" : "bg-secondary"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Show this QR code at the theater entrance
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <Button
              variant="outline"
              onClick={handleDownloadReceipt}
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Receipt
            </Button>
            <Button asChild className="flex-1">
              <Link to="/">
                <Home className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
            </Button>
          </div>

          {/* Note */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            Please arrive at least 15 minutes before the show time. Carry a valid ID proof.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BookingConfirmation;
