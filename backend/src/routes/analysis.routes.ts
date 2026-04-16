import { Router } from "express";
import {
  getAnalyses,
  getAnalysisById,
  createAnalysis,
  deleteAnalysis,
  streamAnalysis,
  streamAdCopy,
} from "../controllers/analysis.controller";

const router = Router();

router.get("/:userId", getAnalyses);
router.get("/detail/:id", getAnalysisById);
router.post("/", createAnalysis);
router.delete("/:id", deleteAnalysis);
router.post("/stream", streamAnalysis);
router.post("/generate-copy", streamAdCopy);

export default router;
