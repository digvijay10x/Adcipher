import { Request, Response } from "express";
import prisma from "../config/db";
import { analyzeAdsWithStreaming } from "../services/claude.service";
import { generateAdCopyWithStreaming } from "../services/adcopy.service";

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

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

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

export const streamAnalysis = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const competitors = await prisma.competitor.findMany({
      where: { userId },
      include: { ads: true },
    });

    if (competitors.length === 0) {
      return res.status(400).json({ error: "Add competitors first" });
    }

    const adsData = competitors.flatMap((competitor) =>
      competitor.ads.length > 0
        ? competitor.ads.map((ad) => ({
            competitor: competitor.name || competitor.domain,
            platform: ad.platform,
            headline: ad.headline || undefined,
            primaryText: ad.primaryText || undefined,
            ctaText: ad.ctaText || undefined,
          }))
        : [
            {
              competitor: competitor.name || competitor.domain,
              platform: "unknown",
              headline: `Competitor: ${competitor.domain}`,
              primaryText: "No ads collected yet - analyzing based on domain",
              ctaText: undefined,
            },
          ],
    );

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    await analyzeAdsWithStreaming(adsData, res);

    res.end();
  } catch (error) {
    console.error("Stream analysis error:", error);
    res.status(500).json({ error: "Failed to stream analysis" });
  }
};

export const streamAdCopy = async (req: Request, res: Response) => {
  try {
    const { gaps, counterStrategy } = req.body;

    if (!gaps || !counterStrategy) {
      return res
        .status(400)
        .json({ error: "gaps and counterStrategy are required" });
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    await generateAdCopyWithStreaming(gaps, counterStrategy, res);

    res.end();
  } catch (error) {
    console.error("Ad copy generation error:", error);
    res.status(500).json({ error: "Failed to generate ad copy" });
  }
};
