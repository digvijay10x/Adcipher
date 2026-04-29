import groq, { MODELS } from "../groq.service";
import { ResearchResult } from "./researchAgent";

export interface PatternResult {
  hooks: {
    name: string;
    description: string;
    usedBy: string[];
    frequency: string;
  }[];
  saturatedAngles: {
    angle: string;
    reason: string;
    brands: string[];
  }[];
}

export const runPatternAgent = async (
  researchData: ResearchResult[],
): Promise<{ raw: string; parsed: PatternResult }> => {
  const context = researchData
    .map((r) => {
      const adsText = r.ads
        .map(
          (ad, i) =>
            `  Ad ${i + 1} [${ad.platform}]: Headline: "${ad.headline}" | Body: "${ad.primaryText}" | CTA: "${ad.cta}"`,
        )
        .join("\n");
      return `Brand: ${r.brand}\nStrategy: ${r.summary}\n${adsText}`;
    })
    .join("\n\n---\n\n");

  const prompt = `You are an expert ad psychologist and pattern analyst. Analyze the following competitor ad research data and identify patterns.

${context}

Analyze ALL the ads above and identify:

1. PSYCHOLOGICAL HOOKS: What persuasion techniques are being used? (urgency, social proof, fear of missing out, authority, scarcity, emotional appeal, etc.) For each hook, name it, describe how it's used, list which brands use it, and rate its frequency as "high", "medium", or "low".

2. SATURATED ANGLES: Which messaging approaches are OVERUSED across multiple competitors? These are angles a new advertiser should AVOID because the market is tired of them. For each, explain why it's saturated and which brands are guilty.

Respond in this exact JSON format and nothing else:

{
  "hooks": [
    {
      "name": "Hook name",
      "description": "How this hook is being used across the ads",
      "usedBy": ["Brand1", "Brand2"],
      "frequency": "high"
    }
  ],
  "saturatedAngles": [
    {
      "angle": "The overused messaging angle",
      "reason": "Why this is saturated and should be avoided",
      "brands": ["Brand1", "Brand2"]
    }
  ]
}

Return ONLY valid JSON. No markdown, no code fences, no explanation.`;

  const response = await groq.chat.completions.create({
    model: MODELS.ANALYSIS,
    messages: [{ role: "user", content: prompt }],
  });

  const raw = response.choices[0]?.message?.content || "{}";

  let parsed: PatternResult = { hooks: [], saturatedAngles: [] };
  try {
    const cleaned = raw
      .replace(/```json\s?/g, "")
      .replace(/```/g, "")
      .trim();
    parsed = JSON.parse(cleaned);
  } catch (error) {
    console.error("Failed to parse pattern results:", error);
  }

  return { raw, parsed };
};
