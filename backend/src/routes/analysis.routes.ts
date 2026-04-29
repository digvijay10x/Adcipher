import { Router } from "express";
import {
  getAnalyses,
  getAnalysisById,
  createAnalysis,
  deleteAnalysis,
  streamPipeline,
  streamGenerateCopy,
} from "../controllers/analysis.controller";

const router = Router();

router.get("/:userId", getAnalyses);
router.get("/detail/:id", getAnalysisById);
router.post("/", createAnalysis);
router.delete("/:id", deleteAnalysis);
router.post("/pipeline", streamPipeline);
router.post("/generate-copy", streamGenerateCopy);

export default router;
