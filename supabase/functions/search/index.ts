import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { query = "", island } = await req.json();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Empty query — return all verified entries ordered by island then name
    if (!query.trim()) {
      let builder = supabase
        .from("place_names")
        .select("*")
        .eq("verified", true)
        .order("island", { ascending: true })
        .order("name_hawaiian", { ascending: true });

      if (island) builder = builder.eq("island", island);

      const { data, error } = await builder;
      if (error) throw error;

      return new Response(JSON.stringify({ results: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Full-text search with prefix matching
    // Use websearch type which handles the query string safely
    let builder = supabase
      .from("place_names")
      .select("*")
      .eq("verified", true)
      .textSearch("fts", query.trim(), { type: "websearch", config: "english" });

    if (island) builder = builder.eq("island", island);

    const { data: ftsResults, error: ftsError } = await builder;
    if (ftsError) throw ftsError;

    if (ftsResults && ftsResults.length > 0) {
      return new Response(JSON.stringify({ results: ftsResults }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fallback: ilike partial match
    let fallback = supabase
      .from("place_names")
      .select("*")
      .eq("verified", true)
      .or(
        `name_hawaiian.ilike.%${query}%,` +
        `name_english.ilike.%${query}%,` +
        `meaning.ilike.%${query}%,` +
        `region.ilike.%${query}%`
      )
      .order("name_hawaiian", { ascending: true });

    if (island) fallback = fallback.eq("island", island);

    const { data: fallbackResults, error: fallbackError } = await fallback;
    if (fallbackError) throw fallbackError;

    return new Response(JSON.stringify({ results: fallbackResults ?? [] }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
