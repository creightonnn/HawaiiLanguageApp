import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req: Request) => {
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

      if (island) {
        builder = builder.eq("island", island);
      }

      const { data, error } = await builder;
      if (error) throw error;

      return new Response(JSON.stringify({ results: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Full-text search using the generated fts column
    // We use textSearch for ranked results, then fall back to ilike for partial matches
    const tsQuery = query
      .trim()
      .split(/\s+/)
      .map((w: string) => w + ":*")
      .join(" & ");

    let builder = supabase
      .from("place_names")
      .select("*")
      .eq("verified", true)
      .textSearch("fts", tsQuery, { type: "websearch", config: "english" });

    if (island) {
      builder = builder.eq("island", island);
    }

    const { data: ftsResults, error: ftsError } = await builder;
    if (ftsError) throw ftsError;

    // If full-text search returned nothing, fall back to case-insensitive partial match
    if (ftsResults && ftsResults.length > 0) {
      return new Response(JSON.stringify({ results: ftsResults }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fallback: ilike across key text fields
    let fallbackBuilder = supabase
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

    if (island) {
      fallbackBuilder = fallbackBuilder.eq("island", island);
    }

    const { data: fallbackResults, error: fallbackError } = await fallbackBuilder;
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
