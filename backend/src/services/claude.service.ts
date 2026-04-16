import Groq from "groq-sdk";
import { Response } from "express";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

interface AdData {
  competitor: string;
  platform: string;
  headline?: string;
  primaryText?: string;
  ctaText?: string;
}

export const analyzeAdsWithStreaming = async (
  ads: AdData[],
  res: Response,
): Promise<void> => {
  const adsContext = ads
    .map(
      (ad, i) =>
        `Ad ${i + 1} (${ad.competitor} - ${ad.platform}):
    Headline: ${ad.headline || "N/A"}
    Primary Text: ${ad.primaryText || "N/A"}
    CTA: ${ad.ctaText || "N/A"}`,
    )
    .join("\n\n");

  const prompt = `You are an expert ad strategist analyzing competitor ads to find opportunities.

Here are the competitor ads to analyze:

${adsContext}

Provide a comprehensive analysis with the following sections:

## Hook Analysis
Identify the psychological hooks and persuasion techniques used in these ads. List each hook found.

## Saturated Angles (What to Avoid)
Identify messaging angles that are overused across these competitors. These are angles the user should AVOID because the market is tired of them.

## Gap Opportunities (Whitespace)
Identify what NONE of these competitors are saying. These are fresh angles and messages that could help the user stand out.

## Counter-Strategy
Based on your analysis, provide 3-5 specific, actionable ad angles the user should test. Each should be different from what competitors are doing.

## Ready-to-Test Headlines
Provide 5 headline variations the user can test immediately, based on the gaps you identified.

Be specific, actionable, and strategic.`;

  try {
    const stream = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
  } catch (error: any) {
    console.error("Groq API error:", error.message);
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
  }
};

export const generateAdCopy = async (
  strategy: string,
  gaps: string[],
): Promise<string> => {
  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "user",
        content: `Based on this counter-strategy and gaps, generate 3 complete ad variations.

Strategy: ${strategy}

Gaps to exploit: ${gaps.join(", ")}

For each ad, provide:
- Headline (max 40 chars)
- Primary Text (max 125 chars)
- Description (max 30 chars)
- CTA Text

Format as JSON array.`,
      },
    ],
  });

  return response.choices[0]?.message?.content || "";
};
