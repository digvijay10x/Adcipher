import { Router } from "express";
import {
  getCompetitors,
  addCompetitor,
  deleteCompetitor,
} from "../controllers/competitor.controller";

const router = Router();

router.get("/:userId", getCompetitors);
router.post("/", addCompetitor);
router.delete("/:id", deleteCompetitor);

export default router;
