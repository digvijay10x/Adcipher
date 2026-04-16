import { Router } from "express";
import { scrapeAds, getAds } from "../controllers/ads.controller";

const router = Router();

router.post("/scrape/:competitorId", scrapeAds);
router.get("/:competitorId", getAds);

export default router;
