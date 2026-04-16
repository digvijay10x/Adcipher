import { Router } from "express";
import competitorRoutes from "./competitor.routes";
import analysisRoutes from "./analysis.routes";
import userRoutes from "./user.routes";
import adsRoutes from "./ads.routes";

const router = Router();

router.use("/users", userRoutes);
router.use("/competitors", competitorRoutes);
router.use("/analysis", analysisRoutes);
router.use("/ads", adsRoutes);

export default router;
