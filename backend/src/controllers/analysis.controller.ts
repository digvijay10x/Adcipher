import { Request, Response } from "express";
import prisma from "../config/db";
import { runPipeline } from "../services/pipeline";

export const getAnalyses = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const analyses = await prisma.analysis.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    res.json(analyses);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch analyses" });
  }
};

export const getAnalysisById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const analysis = await prisma.analysis.findUnique({
      where: { id },
    });

    if (!analysis) {
      return res.status(404).json({ error: "Analysis not found" });
    }

    res.json(analysis);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch analysis" });
  }
};

export const createAnalysis = async (req: Request, res: Response) => {
  try {
    const { userId, title, hooks, saturatedAngles, gaps, counterStrategy } =
      req.body;

    const analysis = await prisma.analysis.create({
      data: {
        userId,
        title,
        hooks,
        saturatedAngles,
        gaps,
        counterStrategy,
      },
    });

    res.status(201).json(analysis);
  } catch (error) {
    res.status(500).json({ error: "Failed to create analysis" });
  }
};

export const deleteAnalysis = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.analysis.delete({
      where: { id },
    });

    res.json({ message: "Analysis deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete analysis" });
  }
};

export const streamPipeline = async (req: Request, res: Response) => {
  try {
    const { userId, brands } = req.body;

    if (!userId || !brands || !brands.length) {
      return res.status(400).json({ error: "userId and brands are required" });
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    await runPipeline(userId, brands, res);

    res.end();
  } catch (error) {
    console.error("Pipeline error:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Pipeline failed" });
    }
  }
};

export const streamGenerateCopy = async (req: Request, res: Response) => {
  try {
    const { gaps, strategy } = req.body;

    if (!gaps || !strategy) {
      return res.status(400).json({ error: "gaps and strategy are required" });
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const Groq = (await import("groq-sdk")).default;
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const prompt = `You are a world-class ad copywriter. Generate 3 ad variations based on:

GAPS: ${gaps.join(", ")}
STRATEGY: ${strategy}

For each ad provide headline (max 40 chars), primaryText (max 125 chars), description (max 30 chars), cta, angle, and platform (meta/google/linkedin).

Return ONLY valid JSON: {"ads":[{...}]}`;

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
    res.end();
  } catch (error: any) {
    console.error("Generate copy error:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to generate copy" });
    }
  }
};
