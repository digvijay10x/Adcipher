import groq, { MODELS } from "../groq.service";
import { PatternResult } from "./patternAgent";
import { ResearchResult } from "./researchAgent";

export interface StrategyResult {
  gaps: {
    opportunity: string;
    reasoning: string;
    targetEmotion: string;
  }[];
  counterStrategy: {
    positioning: string;
    angles: {
      angle: string;
      description: string;
      whyItWorks: string;
    }[];
  };
}

export const runStrategyAgent = async (
  researchData: ResearchResult[],
  patternData: PatternResult,
  ragContext?: string,
): Promise<{ raw: string; parsed: StrategyResult }> => {
  const brandsSummary = researchData
    .map((r) => `${r.brand}: ${r.summary}`)
    .join("\n");

  const hooksSummary = patternData.hooks
    .map((h) => `- ${h.name} (${h.frequency}): ${h.description}`)
    .join("\n");

  const saturatedSummary = patternData.saturatedAngles
    .map((s) => `- ${s.angle}: ${s.reason}`)
    .join("\n");

  const ragSection = ragContext
    ? `\n\nPAST ANALYSIS CONTEXT (use this to make smarter recommendations):\n${ragContext}`
    : "";

  const prompt = `You are an elite advertising strategist. Based on the competitive intelligence below, find whitespace opportunities and generate a counter-strategy.

COMPETITOR OVERVIEW:
${brandsSummary}

PSYCHOLOGICAL HOOKS IN USE:
${hooksSummary}

SATURATED ANGLES TO AVOID:
${saturatedSummary}${ragSection}

Your job:
1. GAPS: Find 3-5 messaging opportunities that NONE of these competitors are exploiting. For each gap, explain the opportunity, your reasoning, and what emotion it targets.

2. COUNTER-STRATEGY: Create a clear positioning statement and 3-5 specific ad angles that exploit these gaps. Each angle should be different from what competitors are doing. Explain why each angle works.

Respond in this exact JSON format and nothing else:

{
  "gaps": [
    {
      "opportunity": "The whitespace opportunity",
      "reasoning": "Why this gap exists and why it matters",
      "targetEmotion": "The primary emotion this targets"
    }
  ],
  "counterStrategy": {
    "positioning": "One clear positioning statement for how to stand out",
    "angles": [
      {
        "angle": "Name of the ad angle",
        "description": "What the ad would say or show",
        "whyItWorks": "Why this is effective given the competitive landscape"
      }
    ]
  }
}

Return ONLY valid JSON. No markdown, no code fences, no explanation.`;

  const response = await groq.chat.completions.create({
    model: MODELS.ANALYSIS,
    messages: [{ role: "user", content: prompt }],
  });

  const raw = response.choices[0]?.message?.content || "{}";

  let parsed: StrategyResult = {
    gaps: [],
    counterStrategy: { positioning: "", angles: [] },
  };
  try {
    const cleaned = raw
      .replace(/```json\s?/g, "")
      .replace(/```/g, "")
      .trim();
    parsed = JSON.parse(cleaned);
  } catch (error) {
    console.error("Failed to parse strategy results:", error);
  }

  return { raw, parsed };
};
