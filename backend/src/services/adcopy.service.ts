import Groq from "groq-sdk";
import { Response } from "express";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export const generateAdCopyWithStreaming = async (
  gaps: string[],
  counterStrategy: string,
  res: Response,
): Promise<void> => {
  const prompt = `You are an expert ad copywriter. Based on the market gaps and counter-strategy below, generate ready-to-use ad copy.

## Market Gaps (Opportunities)
${gaps.join("\n")}

## Counter-Strategy
${counterStrategy}

Generate 3 complete ad variations. For EACH ad, provide:

### Ad 1
**Headline:** (max 40 characters)
**Primary Text:** (max 125 characters, compelling hook + value prop)
**Description:** (max 30 characters)
**CTA:** (e.g., "Learn More", "Get Started", "Shop Now")

### Ad 2
(same format)

### Ad 3
(same format)

Make each ad distinctly different in approach:
- Ad 1: Direct benefit-focused
- Ad 2: Curiosity/intrigue-based
- Ad 3: Social proof or urgency angle

Be specific, punchy, and ready to copy-paste into Meta or Google ads.`;

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
