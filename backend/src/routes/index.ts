import { Router } from "express";
import "../routes/index"; // Ensure all route modules are imported
import authRoutes from "../modules/auth/auth.routes";
import projectRoutes from "../modules/projects/project.routes";
import featureRoutes from "../modules/features/feature.routes";
import analysisRoutes from "../modules/analysis/analysis.routes";
import aiRoutes from "../modules/ai/ai.routes";
import dashboardRoutes from "../modules/dashboard/dashboard.routes";
import userRoutes from "../modules/users/user.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/projects", projectRoutes);
router.use("/projects/:projectId/features", featureRoutes);
router.use("/projects/:projectId/analyses", analysisRoutes);
router.use("/projects/:projectId", aiRoutes);
router.use("/dashboard", dashboardRoutes);

export default router;
