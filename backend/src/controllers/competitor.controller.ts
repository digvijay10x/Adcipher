import { Request, Response } from "express";
import prisma from "../config/db";

export const getCompetitors = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const competitors = await prisma.competitor.findMany({
      where: { userId },
      include: { ads: true },
      orderBy: { createdAt: "desc" },
    });

    res.json(competitors);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch competitors" });
  }
};

export const addCompetitor = async (req: Request, res: Response) => {
  try {
    const { brand, name, userId } = req.body;

    if (!brand || !userId) {
      return res.status(400).json({ error: "Brand and userId are required" });
    }

    const competitor = await prisma.competitor.create({
      data: {
        brand,
        name: name || brand,
        userId,
      },
    });

    res.status(201).json(competitor);
  } catch (error) {
    res.status(500).json({ error: "Failed to add competitor" });
  }
};

export const deleteCompetitor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.competitor.delete({
      where: { id },
    });

    res.json({ message: "Competitor deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete competitor" });
  }
};
