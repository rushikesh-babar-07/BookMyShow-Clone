import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface BookingDetails {
  movieId: string;
  movieTitle: string;
  seats: number;
  showDate: string;
  showTime: string;
  totalAmount: number;
  seatIds?: string[];
}

export const useBooking = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const createBooking = async (details: BookingDetails): Promise<{ id: string } | null> => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to book tickets.",
        variant: "destructive",
      });
      return null;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.rpc('create_booking' as never, {} as never).maybeSingle();
      
      // Direct insert using raw SQL-like approach
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          user_id: user.id,
          movie_id: details.movieId,
          seats: details.seats,
          total_amount: details.totalAmount,
          show_date: details.showDate,
          show_time: details.showTime,
          status: 'pending'
        })
      });

      if (!response.ok) throw new Error('Failed to create booking');
      
      const bookings = await response.json();
      const booking = bookings[0];

      toast({
        title: "Booking created",
        description: `Booking for ${details.movieTitle} is pending payment.`,
      });

      return { id: booking.id };
    } catch (err) {
      toast({
        title: "Booking failed",
        description: err instanceof Error ? err.message : "Failed to create booking",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const processPayment = async (bookingId: string, movieTitle: string) => {
    setLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000 + Math.random() * 1000));
      const paymentId = `PAY_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const session = await supabase.auth.getSession();
      await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/bookings?id=eq.${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          'Authorization': `Bearer ${session.data.session?.access_token}`,
        },
        body: JSON.stringify({
          status: 'paid',
          payment_id: paymentId,
          updated_at: new Date().toISOString(),
        })
      });

      toast({
        title: "🎉 Payment Successful!",
        description: `Your booking for "${movieTitle}" has been confirmed! (Payment ID: ${paymentId})`,
      });

      alert(`📧 Mock Email Notification:\n\nYour booking for "${movieTitle}" has been confirmed!\nPayment ID: ${paymentId}\n\nThank you for booking with BookMyShow!`);

      return { success: true, paymentId };
    } catch (err) {
      toast({
        title: "Payment failed",
        description: err instanceof Error ? err.message : "Failed to process payment",
        variant: "destructive",
      });
      return { success: false, paymentId: null };
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (bookingId: string) => {
    setLoading(true);
    try {
      const session = await supabase.auth.getSession();
      await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/bookings?id=eq.${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          'Authorization': `Bearer ${session.data.session?.access_token}`,
        },
        body: JSON.stringify({ status: 'cancelled', updated_at: new Date().toISOString() })
      });
      toast({ title: "Booking cancelled", description: "Your booking has been cancelled successfully." });
      return true;
    } catch (err) {
      toast({ title: "Cancellation failed", description: "Failed to cancel booking", variant: "destructive" });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { createBooking, processPayment, cancelBooking, loading };
};
