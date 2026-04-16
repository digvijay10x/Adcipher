import { Request, Response } from "express";
import prisma from "../config/db";
import { scrapeCompetitorAds } from "../services/adScraper.service";

export const scrapeAds = async (req: Request, res: Response) => {
  try {
    const { competitorId } = req.params;

    const competitor = await prisma.competitor.findUnique({
      where: { id: competitorId },
    });

    if (!competitor) {
      return res.status(404).json({ error: "Competitor not found" });
    }

    res.json({ message: "Scraping started", status: "processing" });

    // Run scraping in background
    scrapeCompetitorAds(competitorId).catch(console.error);
  } catch (error) {
    console.error("Scrape error:", error);
    res.status(500).json({ error: "Failed to start scraping" });
  }
};

export const getAds = async (req: Request, res: Response) => {
  try {
    const { competitorId } = req.params;

    const ads = await prisma.ad.findMany({
      where: { competitorId },
      orderBy: { createdAt: "desc" },
    });

    res.json(ads);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch ads" });
  }
};
