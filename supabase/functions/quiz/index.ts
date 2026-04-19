import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

type QuestionType = "meaning" | "island" | "mooolelo";

interface PlaceName {
  id: string;
  name_hawaiian: string;
  name_english: string | null;
  meaning: string;
  mooolelo: string | null;
  island: string;
  region: string | null;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function truncate(text: string, maxLen = 80): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen - 1).trimEnd() + "…";
}

function buildQuestion(
  correct: PlaceName,
  distractors: PlaceName[],
  questionType: QuestionType
): {
  question: string;
  options: string[];
  correct_index: number;
  place_name_id: string;
} {
  let question: string;
  let correctAnswer: string;
  let wrongAnswers: string[];

  switch (questionType) {
    case "meaning":
      question = `What does "${correct.name_hawaiian}" mean?`;
      correctAnswer = correct.meaning;
      wrongAnswers = distractors.map((d) => d.meaning);
      break;

    case "island":
      question = `Which island is ${correct.name_hawaiian} located on?`;
      correctAnswer = correct.island;
      // Deduplicate — distractors may share an island with the correct entry
      wrongAnswers = [...new Set(distractors.map((d) => d.island))].filter(
        (i) => i !== correct.island
      );
      // Pad with known islands if we don't have 3 unique distractors
      const allIslands = ["Oʻahu", "Maui", "Hawaiʻi", "Kauaʻi", "Molokaʻi", "Lānaʻi"];
      for (const isl of allIslands) {
        if (wrongAnswers.length >= 3) break;
        if (isl !== correct.island && !wrongAnswers.includes(isl)) {
          wrongAnswers.push(isl);
        }
      }
      wrongAnswers = wrongAnswers.slice(0, 3);
      break;

    case "mooolelo": {
      // Ask which place name matches a snippet of its moʻolelo
      if (!correct.mooolelo) {
        // Fallback to meaning question if no moʻolelo
        question = `What does "${correct.name_hawaiian}" mean?`;
        correctAnswer = correct.meaning;
        wrongAnswers = distractors.map((d) => d.meaning);
        break;
      }
      // Take the first sentence as the clue
      const snippet = truncate(correct.mooolelo.split(".")[0].trim() + ".", 120);
      question = `Which place is described here? "${snippet}"`;
      correctAnswer = correct.name_hawaiian;
      wrongAnswers = distractors.map((d) => d.name_hawaiian);
      break;
    }
  }

  // Build 4-option array in shuffled order
  const allOptions = shuffle([correctAnswer, ...wrongAnswers.slice(0, 3)]);
  const correct_index = allOptions.indexOf(correctAnswer);

  return {
    question,
    options: allOptions,
    correct_index,
    place_name_id: correct.id,
  };
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const island: string | undefined = body.island;
    const questionType: QuestionType = body.question_type ?? "meaning";

    if (!["meaning", "island", "mooolelo"].includes(questionType)) {
      return new Response(
        JSON.stringify({ error: "question_type must be meaning, island, or mooolelo" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch the pool of verified entries to draw from
    let poolBuilder = supabase
      .from("place_names")
      .select("id, name_hawaiian, name_english, meaning, mooolelo, island, region")
      .eq("verified", true);

    if (island) {
      poolBuilder = poolBuilder.eq("island", island);
    }

    const { data: pool, error: poolError } = await poolBuilder;
    if (poolError) throw poolError;

    if (!pool || pool.length < 4) {
      return new Response(
        JSON.stringify({
          error:
            "Not enough verified entries to generate a quiz question. Need at least 4.",
        }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Pick one random correct entry
    const correctIdx = Math.floor(Math.random() * pool.length);
    const correct: PlaceName = pool[correctIdx];

    // Pick 3 distractor entries (different from correct)
    const rest = pool.filter((_: PlaceName, i: number) => i !== correctIdx);
    const distractors: PlaceName[] = shuffle(rest).slice(0, 3);

    const result = buildQuestion(correct, distractors, questionType);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
