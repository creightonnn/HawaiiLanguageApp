import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Return only the lightweight fields needed for map rendering
    const { data, error } = await supabase
      .from("place_names")
      .select("id, name_hawaiian, meaning, island, latitude, longitude")
      .eq("verified", true)
      .not("latitude", "is", null)
      .not("longitude", "is", null)
      .order("island", { ascending: true })
      .order("name_hawaiian", { ascending: true });

    if (error) throw error;

    return new Response(JSON.stringify({ pins: data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
