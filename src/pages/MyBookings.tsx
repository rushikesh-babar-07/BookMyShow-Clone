import { useUserBookings } from "@/hooks/useUserBookings";
import { useBooking } from "@/hooks/useBooking";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, Clock, Ticket, CreditCard } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-500",
  paid: "bg-green-500/20 text-green-500",
  cancelled: "bg-red-500/20 text-red-500",
  expired: "bg-gray-500/20 text-gray-500",
};

const MyBookings = () => {
  const { bookings, loading, error } = useUserBookings();
  const { processPayment, cancelBooking, loading: actionLoading } = useBooking();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
          My Bookings
        </h1>

        {error && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {bookings.length === 0 ? (
          <Card className="bg-card border-border">
            <CardContent className="py-12 text-center">
              <Ticket className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                No bookings yet
              </h3>
              <p className="text-muted-foreground mb-4">
                Start by booking tickets for your favorite movies!
              </p>
              <Button onClick={() => navigate("/")}>
                Browse Movies
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {bookings.map((booking) => (
              <Card key={booking.id} className="bg-card border-border overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    {/* Movie Poster */}
                    <div className="md:w-32 h-40 md:h-auto">
                      <img
                        src={booking.movie?.poster_url || "/placeholder.svg"}
                        alt={booking.movie?.title || "Movie"}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Booking Details */}
                    <div className="flex-1 p-4 md:p-6">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">
                            {booking.movie?.title || "Unknown Movie"}
                          </h3>
                          
                          <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="h-4 w-4" />
                              <span>{format(new Date(booking.show_date), "EEE, MMM d, yyyy")}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Clock className="h-4 w-4" />
                              <span>{booking.show_time}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Ticket className="h-4 w-4" />
                              <span>{booking.seats} {booking.seats === 1 ? "seat" : "seats"}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 mt-3">
                            <Badge className={statusColors[booking.status]}>
                              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                            </Badge>
                            {booking.payment_id && (
                              <span className="text-xs text-muted-foreground">
                                Payment: {booking.payment_id}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <p className="text-lg font-bold text-foreground">
                            ₹{booking.total_amount}
                          </p>

                          {booking.status === "pending" && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => cancelBooking(booking.id)}
                                disabled={actionLoading}
                              >
                                Cancel
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => processPayment(booking.id, booking.movie?.title || "Movie")}
                                disabled={actionLoading}
                              >
                                {actionLoading ? (
                                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                ) : (
                                  <CreditCard className="h-4 w-4 mr-1" />
                                )}
                                Pay Now
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default MyBookings;
