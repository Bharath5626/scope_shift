import { Router } from "express";
import * as controller from "./dashboard.controller";

const router = Router();

router.get(
  "/:projectId",
  controller.getDashboard
);

router.get(
  "/stats/overall",
  controller.getOverallDashboardStats
);

export default router;