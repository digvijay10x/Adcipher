import { Router } from "express";
import competitorRoutes from "./competitor.routes";
import analysisRoutes from "./analysis.routes";
import userRoutes from "./user.routes";

const router = Router();

router.use("/users", userRoutes);
router.use("/competitors", competitorRoutes);
router.use("/analysis", analysisRoutes);

export default router;
