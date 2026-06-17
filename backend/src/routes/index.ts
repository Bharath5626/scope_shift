import { Router } from "express";

import authRoutes from "../modules/auth/auth.routes";
import projectRoutes from "../modules/projects/project.routes";
import scopeVersionRoutes from "../modules/scopeVersions/scopeVersion.routes";
import dashboardRoutes from "../modules/dashboard/dashboard.routes";
import analysisRoutes from "../modules/analysis/analysis.routes";



const router = Router();

router.use("/auth", authRoutes);

router.use("/projects", projectRoutes);

router.use(
  "/scope-versions",
  scopeVersionRoutes
);
router.use(
  "/dashboard",
  dashboardRoutes
);
router.use(
  "/analysis",
  analysisRoutes
);

export default router;