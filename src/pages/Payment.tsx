import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useBooking } from "@/hooks/useBooking";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { CreditCard, Smartphone, Loader2, Film, MapPin, Calendar, Clock, Armchair } from "lucide-react";
import { format } from "date-fns";

interface PaymentState {
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
}

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { createBooking, processPayment, loading } = useBooking();
  
  const [paymentMethod, setPaymentMethod] = useState<"debit" | "credit" | "upi">("upi");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const [upiId, setUpiId] = useState("");
  
  const paymentData = location.state as PaymentState | null;

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
    if (!paymentData) {
      navigate("/");
    }
  }, [user, authLoading, paymentData, navigate]);

  if (authLoading || !paymentData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const handlePayment = async () => {
    // Create booking first
    const booking = await createBooking({
      movieId: paymentData.movieId,
      movieTitle: paymentData.movieTitle,
      seats: paymentData.seatCount,
      showDate: paymentData.date,
      showTime: paymentData.time,
      totalAmount: paymentData.totalAmount,
      seatIds: paymentData.seats,
    });

    if (booking) {
      // Process payment
      const result = await processPayment(booking.id, paymentData.movieTitle);
      if (result.success) {
        // Navigate to confirmation page
        navigate("/booking-confirmation", {
          state: {
            ...paymentData,
            bookingId: booking.id,
            paymentId: result.paymentId,
            paymentMethod,
          },
        });
      }
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(" ") : value;
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return v.substring(0, 2) + "/" + v.substring(2, 4);
    }
    return v;
  };

  const isFormValid = () => {
    if (paymentMethod === "upi") {
      return upiId.includes("@");
    }
    return cardNumber.replace(/\s/g, "").length === 16 && 
           cardExpiry.length === 5 && 
           cardCvv.length >= 3 && 
           cardName.length > 0;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-foreground mb-6">Complete Your Payment</h1>
        
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Payment Methods */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Select Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(value) => setPaymentMethod(value as "debit" | "credit" | "upi")}
                  className="space-y-4"
                >
                  {/* UPI Option */}
                  <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:border-primary/50 transition-colors">
                    <RadioGroupItem value="upi" id="upi" />
                    <Label htmlFor="upi" className="flex items-center gap-3 cursor-pointer flex-1">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Smartphone className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">UPI</p>
                        <p className="text-sm text-muted-foreground">Pay using UPI ID</p>
                      </div>
                    </Label>
                  </div>

                  {/* Debit Card Option */}
                  <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:border-primary/50 transition-colors">
                    <RadioGroupItem value="debit" id="debit" />
                    <Label htmlFor="debit" className="flex items-center gap-3 cursor-pointer flex-1">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <CreditCard className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Debit Card</p>
                        <p className="text-sm text-muted-foreground">Visa, Mastercard, RuPay</p>
                      </div>
                    </Label>
                  </div>

                  {/* Credit Card Option */}
                  <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:border-primary/50 transition-colors">
                    <RadioGroupItem value="credit" id="credit" />
                    <Label htmlFor="credit" className="flex items-center gap-3 cursor-pointer flex-1">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <CreditCard className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Credit Card</p>
                        <p className="text-sm text-muted-foreground">Visa, Mastercard, Amex</p>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Payment Form */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">
                  {paymentMethod === "upi" ? "Enter UPI Details" : `Enter ${paymentMethod === "debit" ? "Debit" : "Credit"} Card Details`}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {paymentMethod === "upi" ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="upi-id" className="text-foreground">UPI ID</Label>
                      <Input
                        id="upi-id"
                        placeholder="yourname@upi"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        className="mt-1.5 bg-secondary border-border"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Enter your UPI ID (e.g., name@paytm, name@oksbi)
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="card-name" className="text-foreground">Cardholder Name</Label>
                      <Input
                        id="card-name"
                        placeholder="Name on card"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        className="mt-1.5 bg-secondary border-border"
                      />
                    </div>
                    <div>
                      <Label htmlFor="card-number" className="text-foreground">Card Number</Label>
                      <Input
                        id="card-number"
                        placeholder="1234 5678 9012 3456"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                        maxLength={19}
                        className="mt-1.5 bg-secondary border-border"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="card-expiry" className="text-foreground">Expiry Date</Label>
                        <Input
                          id="card-expiry"
                          placeholder="MM/YY"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                          maxLength={5}
                          className="mt-1.5 bg-secondary border-border"
                        />
                      </div>
                      <div>
                        <Label htmlFor="card-cvv" className="text-foreground">CVV</Label>
                        <Input
                          id="card-cvv"
                          type="password"
                          placeholder="***"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                          maxLength={4}
                          className="mt-1.5 bg-secondary border-border"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Button
              onClick={handlePayment}
              disabled={loading || !isFormValid()}
              className="w-full h-12 text-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Processing Payment...
                </>
              ) : (
                `Pay ₹${paymentData.totalAmount}`
              )}
            </Button>
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <Card className="bg-card border-border sticky top-4">
              <CardHeader>
                <CardTitle className="text-foreground">Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Movie Info */}
                <div className="flex gap-3">
                  <img
                    src={paymentData.moviePoster || "/placeholder.svg"}
                    alt={paymentData.movieTitle}
                    className="w-16 h-24 object-cover rounded"
                  />
                  <div>
                    <h3 className="font-semibold text-foreground">{paymentData.movieTitle}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {paymentData.seatCount} {paymentData.seatCount === 1 ? "Ticket" : "Tickets"}
                    </p>
                  </div>
                </div>

                <Separator className="bg-border" />

                {/* Details */}
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{paymentData.theaterName}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-primary" />
                    <p className="text-sm text-foreground">
                      {format(new Date(paymentData.date), "EEE, MMM d, yyyy")}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-primary" />
                    <p className="text-sm text-foreground">{paymentData.time}</p>
                  </div>

                  <div className="flex items-start gap-3">
                    <Armchair className="h-4 w-4 text-primary mt-0.5" />
                    <p className="text-sm text-foreground font-medium">
                      {paymentData.seats.sort().join(", ")}
                    </p>
                  </div>
                </div>

                <Separator className="bg-border" />

                {/* Price Breakdown */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tickets ({paymentData.seatCount} x ₹{paymentData.pricePerSeat})</span>
                    <span className="text-foreground">₹{paymentData.seatCount * paymentData.pricePerSeat}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Convenience Fee</span>
                    <span className="text-foreground">₹{Math.round(paymentData.totalAmount * 0.05)}</span>
                  </div>
                </div>

                <Separator className="bg-border" />

                <div className="flex justify-between items-center">
                  <span className="font-semibold text-foreground">Total Amount</span>
                  <span className="text-xl font-bold text-primary">₹{paymentData.totalAmount}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Payment;
