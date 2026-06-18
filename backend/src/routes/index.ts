import { Router } from "express";

import authRoutes from "../modules/auth/auth.routes";
import projectRoutes from "../modules/projects/project.routes";
import featureRoutes from "../modules/features/feature.routes";
import analysisRoutes from "../modules/analysis/analysis.routes";
import aiRoutes from "../modules/ai/ai.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/projects", projectRoutes);
router.use("/projects/:projectId/features", featureRoutes);
router.use("/projects/:projectId/analyses", analysisRoutes);
router.use("/projects/:projectId", aiRoutes);

export default router;
