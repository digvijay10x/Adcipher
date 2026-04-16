import { Request, Response } from "express";
import prisma from "../config/db";

export const syncUser = async (req: Request, res: Response) => {
  try {
    const { id, email } = req.body;

    if (!id || !email) {
      return res.status(400).json({ error: "id and email are required" });
    }

    const user = await prisma.user.upsert({
      where: { id },
      update: { email },
      create: { id, email },
    });

    res.json(user);
  } catch (error) {
    console.error("Sync user error:", error);
    res.status(500).json({ error: "Failed to sync user" });
  }
};
