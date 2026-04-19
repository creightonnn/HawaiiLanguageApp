import { createClient } from "npm:@supabase/supabase-js@2";
import Anthropic from "npm:@anthropic-ai/sdk@0.27.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

const SYSTEM_PROMPT_TEMPLATE = `You are a knowledgeable and culturally respectful guide to Hawaiian place names.
You ONLY answer questions using the provided context below. If the answer is not in the context, say: "I don't have information on that yet, but our team is always adding new entries."
Never invent Hawaiian words, meanings, or cultural facts.
Always speak with respect for Hawaiian culture and language.

Context:
{CONTEXT}`;

interface PlaceName {
  name_hawaiian: string;
  name_english: string | null;
  pronunciation: string | null;
  meaning: string;
  mooolelo: string | null;
  island: string;
  region: string | null;
}

function buildContextString(entries: PlaceName[]): string {
  if (!entries.length) return "No relevant entries found.";
  return entries
    .map((e, i) => {
      const lines = [
        `[${i + 1}] ${e.name_hawaiian}${e.name_english ? ` (${e.name_english})` : ""}`,
        `    Island: ${e.island}${e.region ? `, ${e.region}` : ""}`,
        `    Pronunciation: ${e.pronunciation ?? "not available"}`,
        `    Meaning: ${e.meaning}`,
      ];
      if (e.mooolelo) lines.push(`    Moʻolelo: ${e.mooolelo}`);
      return lines.join("\n");
    })
    .join("\n\n");
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { session_id, message } = await req.json();

    if (!session_id || typeof session_id !== "string") {
      return new Response(
        JSON.stringify({ error: "session_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (!message || typeof message !== "string" || !message.trim()) {
      return new Response(
        JSON.stringify({ error: "message is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const anthropic = new Anthropic({
      apiKey: Deno.env.get("ANTHROPIC_API_KEY")!,
    });

    // 1. Ensure session exists
    await supabase
      .from("chat_sessions")
      .upsert({ session_id }, { onConflict: "session_id", ignoreDuplicates: true });

    // 2. FTS for 5 most relevant entries
    const tsQuery = message
      .trim()
      .replace(/[^a-zA-Z0-9\s\u0080-\uFFFF]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 1)
      .slice(0, 10)
      .join(" | ");

    let contextEntries: PlaceName[] = [];

    if (tsQuery) {
      const { data: ftsData } = await supabase
        .from("place_names")
        .select("name_hawaiian, name_english, pronunciation, meaning, mooolelo, island, region")
        .textSearch("fts", tsQuery, { type: "websearch", config: "english" })
        .limit(5);
      contextEntries = ftsData ?? [];
    }

    // Pad to 5 with recent verified entries if needed
    if (contextEntries.length < 5) {
      const seen = new Set(contextEntries.map((e) => e.name_hawaiian));
      const { data: padData } = await supabase
        .from("place_names")
        .select("name_hawaiian, name_english, pronunciation, meaning, mooolelo, island, region")
        .eq("verified", true)
        .order("created_at", { ascending: false })
        .limit(10);
      for (const entry of padData ?? []) {
        if (contextEntries.length >= 5) break;
        if (!seen.has(entry.name_hawaiian)) contextEntries.push(entry);
      }
    }

    // 3. Build system prompt
    const systemPrompt = SYSTEM_PROMPT_TEMPLATE.replace(
      "{CONTEXT}",
      buildContextString(contextEntries)
    );

    // 4. Load conversation history (last 10 messages)
    const { data: history } = await supabase
      .from("chat_messages")
      .select("role, content")
      .eq("session_id", session_id)
      .order("created_at", { ascending: true })
      .limit(10);

    const priorMessages: { role: "user" | "assistant"; content: string }[] =
      (history ?? []).map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

    // 5. Call Claude
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: systemPrompt,
      messages: [...priorMessages, { role: "user", content: message.trim() }],
    });

    const assistantContent = response.content[0];
    if (assistantContent.type !== "text") throw new Error("Unexpected response type from Claude API");
    const assistantMessage = assistantContent.text;

    // 6. Persist both turns
    await supabase.from("chat_messages").insert([
      { session_id, role: "user",      content: message.trim() },
      { session_id, role: "assistant", content: assistantMessage },
    ]);

    return new Response(
      JSON.stringify({
        response: assistantMessage,
        context_entries_used: contextEntries.map((e) => e.name_hawaiian),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
