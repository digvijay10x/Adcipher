import groq, { MODELS } from "../groq.service";

export interface ResearchResult {
  brand: string;
  ads: {
    headline: string;
    primaryText: string;
    cta: string;
    platform: string;
    source: string;
  }[];
  summary: string;
}

const researchBrand = async (brand: string): Promise<ResearchResult> => {
  const prompt = `Find 3 current ads by "${brand}" from ad libraries or marketing sites. Return JSON only:
{"brand":"${brand}","ads":[{"headline":"...","primaryText":"...","cta":"...","platform":"meta/google/youtube","source":"..."}],"summary":"2 sentence strategy overview"}`;

  try {
    const response = await groq.chat.completions.create({
      model: MODELS.RESEARCH,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 800,
    });

    const raw = response.choices[0]?.message?.content || "{}";
    const cleaned = raw
      .replace(/```json\s?/g, "")
      .replace(/```/g, "")
      .trim();
    return JSON.parse(cleaned);
  } catch (firstError: any) {
    console.error(`First attempt failed for ${brand}:`, firstError.message);

    // Retry with minimal prompt using analysis model instead
    try {
      const fallbackPrompt = `You are an ad intelligence expert. Based on your knowledge of "${brand}", describe 3 typical ads they currently run across Meta and Google. Include realistic headlines, body copy, CTAs, and platforms. Also summarize their ad strategy in 2 sentences.

Return ONLY this JSON:
{"brand":"${brand}","ads":[{"headline":"...","primaryText":"...","cta":"...","platform":"meta/google/youtube","source":"industry knowledge"}],"summary":"..."}`;

      const fallback = await groq.chat.completions.create({
        model: MODELS.ANALYSIS,
        messages: [{ role: "user", content: fallbackPrompt }],
        max_tokens: 800,
      });

      const raw = fallback.choices[0]?.message?.content || "{}";
      const cleaned = raw
        .replace(/```json\s?/g, "")
        .replace(/```/g, "")
        .trim();
      return JSON.parse(cleaned);
    } catch (secondError: any) {
      console.error(`Fallback also failed for ${brand}:`, secondError.message);
      return {
        brand,
        ads: [],
        summary: `Could not retrieve ad data for ${brand}.`,
      };
    }
  }
};

export const runResearchAgent = async (
  brands: string[],
): Promise<{ raw: string; parsed: ResearchResult[] }> => {
  const results: ResearchResult[] = [];
  let rawAll = "";

  for (const brand of brands) {
    const result = await researchBrand(brand);
    results.push(result);
    rawAll += JSON.stringify(result) + "\n";
  }

  return { raw: rawAll, parsed: results };
};
