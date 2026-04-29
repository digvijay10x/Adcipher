import groq, { MODELS } from "../groq.service";
import { StrategyResult } from "./strategyAgent";

export interface CopyResult {
  ads: {
    headline: string;
    primaryText: string;
    description: string;
    cta: string;
    angle: string;
    platform: string;
  }[];
}

export const runCopyAgent = async (
  strategyData: StrategyResult,
): Promise<{ raw: string; parsed: CopyResult }> => {
  const gapsList = strategyData.gaps
    .map((g) => `- ${g.opportunity} (targets: ${g.targetEmotion})`)
    .join("\n");

  const anglesList = strategyData.counterStrategy.angles
    .map((a) => `- ${a.angle}: ${a.description}`)
    .join("\n");

  const prompt = `You are a world-class ad copywriter. Based on the strategic analysis below, generate ready-to-use ad copy variations.

POSITIONING: ${strategyData.counterStrategy.positioning}

GAPS TO EXPLOIT:
${gapsList}

ANGLES TO USE:
${anglesList}

Generate exactly 3 complete ad variations optimized for paid social and search. Each ad should use a DIFFERENT angle from the list above.

Rules:
- Headline: max 40 characters, punchy and attention-grabbing
- Primary Text: max 125 characters, compelling hook + clear value prop
- Description: max 30 characters, supporting detail
- CTA: one of "Learn More", "Get Started", "Shop Now", "Sign Up", "Try Free"
- Each ad targets a different platform (one for Meta, one for Google, one for LinkedIn)

Respond in this exact JSON format and nothing else:

{
  "ads": [
    {
      "headline": "Short punchy headline",
      "primaryText": "Compelling body copy with hook and value proposition",
      "description": "Brief supporting text",
      "cta": "Learn More",
      "angle": "Which strategic angle this uses",
      "platform": "meta"
    }
  ]
}

Return ONLY valid JSON. No markdown, no code fences, no explanation.`;

  const response = await groq.chat.completions.create({
    model: MODELS.ANALYSIS,
    messages: [{ role: "user", content: prompt }],
  });

  const raw = response.choices[0]?.message?.content || "{}";

  let parsed: CopyResult = { ads: [] };
  try {
    const cleaned = raw
      .replace(/```json\s?/g, "")
      .replace(/```/g, "")
      .trim();
    parsed = JSON.parse(cleaned);
  } catch (error) {
    console.error("Failed to parse copy results:", error);
  }

  return { raw, parsed };
};
