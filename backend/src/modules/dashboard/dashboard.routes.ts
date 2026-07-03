import { Router } from "express";
import * as controller from "./dashboard.controller";
import { verifyToken } from "../../middlewares/auth.middleware";

const router = Router();

router.get(
  "/:projectId",
  verifyToken,
  controller.getDashboard
);

router.get(
  "/stats/overall",
  verifyToken,
  controller.getOverallDashboardStats
);

export default router;