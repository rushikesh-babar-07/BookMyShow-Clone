import { supabase } from "@/integrations/supabase/client";

// Edge function to update movie availability (simulated background task)
export const updateMovieAvailability = async () => {
  // This simulates what a scheduled edge function would do
  const { data: movies } = await supabase
    .from("movies")
    .select("id, release_date, status")
    .eq("status", "coming_soon");

  const today = new Date().toISOString().split("T")[0];

  for (const movie of movies || []) {
    if (movie.release_date && movie.release_date <= today) {
      await supabase
        .from("movies")
        .update({ status: "now_showing" })
        .eq("id", movie.id);
    }
  }
};
