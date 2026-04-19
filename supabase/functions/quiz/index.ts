import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

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

function truncate(text: string, maxLen = 120): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen - 1).trimEnd() + "…";
}

function buildQuestion(
  correct: PlaceName,
  distractors: PlaceName[],
  questionType: QuestionType
) {
  let question: string;
  let correctAnswer: string;
  let wrongAnswers: string[];

  if (questionType === "meaning") {
    question = `What does "${correct.name_hawaiian}" mean?`;
    correctAnswer = correct.meaning;
    wrongAnswers = distractors.map((d) => d.meaning);
  } else if (questionType === "island") {
    question = `Which island is ${correct.name_hawaiian} located on?`;
    correctAnswer = correct.island;
    wrongAnswers = [...new Set(distractors.map((d) => d.island))].filter(
      (i) => i !== correct.island
    );
    const allIslands = ["Oʻahu", "Maui", "Hawaiʻi", "Kauaʻi", "Molokaʻi", "Lānaʻi"];
    for (const isl of allIslands) {
      if (wrongAnswers.length >= 3) break;
      if (isl !== correct.island && !wrongAnswers.includes(isl)) wrongAnswers.push(isl);
    }
    wrongAnswers = wrongAnswers.slice(0, 3);
  } else {
    if (!correct.mooolelo) {
      question = `What does "${correct.name_hawaiian}" mean?`;
      correctAnswer = correct.meaning;
      wrongAnswers = distractors.map((d) => d.meaning);
    } else {
      const snippet = truncate(correct.mooolelo.split(".")[0].trim() + ".");
      question = `Which place is described here? "${snippet}"`;
      correctAnswer = correct.name_hawaiian;
      wrongAnswers = distractors.map((d) => d.name_hawaiian);
    }
  }

  const allOptions = shuffle([correctAnswer, ...wrongAnswers.slice(0, 3)]);
  return {
    question,
    options: allOptions,
    correct_index: allOptions.indexOf(correctAnswer),
    place_name_id: correct.id,
  };
}

Deno.serve(async (req: Request) => {
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

    let poolBuilder = supabase
      .from("place_names")
      .select("id, name_hawaiian, name_english, meaning, mooolelo, island, region")
      .eq("verified", true);

    if (island) poolBuilder = poolBuilder.eq("island", island);

    const { data: pool, error: poolError } = await poolBuilder;
    if (poolError) throw poolError;

    if (!pool || pool.length < 4) {
      return new Response(
        JSON.stringify({ error: "Not enough verified entries to generate a quiz question. Need at least 4." }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const correctIdx = Math.floor(Math.random() * pool.length);
    const correct: PlaceName = pool[correctIdx];
    const distractors: PlaceName[] = shuffle(
      pool.filter((_: PlaceName, i: number) => i !== correctIdx)
    ).slice(0, 3);

    return new Response(JSON.stringify(buildQuestion(correct, distractors, questionType)), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
