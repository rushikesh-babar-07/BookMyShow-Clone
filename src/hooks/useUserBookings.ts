import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Booking {
  id: string;
  user_id: string;
  movie_id: string;
  seats: number;
  total_amount: number;
  status: "pending" | "paid" | "cancelled" | "expired";
  show_date: string;
  show_time: string;
  payment_id: string | null;
  created_at: string;
  movie?: { id: string; title: string; poster_url: string | null };
}

export const useUserBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchBookings = async () => {
    if (!user) return;
    try {
      const session = await supabase.auth.getSession();
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/bookings?user_id=eq.${user.id}&order=created_at.desc`,
        {
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            'Authorization': `Bearer ${session.data.session?.access_token}`,
          }
        }
      );
      const bookingsData = await res.json();
      
      const withMovies = await Promise.all(
        (bookingsData || []).map(async (b: any) => {
          const { data: movie } = await supabase.from("movies").select("id, title, poster_url").eq("id", b.movie_id).maybeSingle();
          return { ...b, movie };
        })
      );
      setBookings(withMovies);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) { setBookings([]); setLoading(false); return; }
    fetchBookings();
  }, [user]);

  return { bookings, loading, error, refetch: fetchBookings };
};
