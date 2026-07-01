import { Router } from "express";
import * as controller from "./project.controller";
import { validate } from "../../middlewares/validate.middleware";
import { createProjectSchema, updateProjectSchema } from "./project.validation";
import { verifyToken } from "../../middlewares/auth.middleware";
import { getProjectAuditLogs } from "../auditLogs/auditLog.controller";

const router = Router();
router.use(verifyToken);
router.get("/", controller.getProjects);
router.get("/analyzed", controller.getAnalyzedProjects);
router.post(
  "/",
  validate(createProjectSchema),
  controller.createProject
);
router.get("/:id", controller.getProjectById);

router.put(
  "/:id",
  validate(updateProjectSchema),
  controller.updateProject
);
router.delete("/:id", controller.deleteProject);
router.get("/:id/audit-logs", getProjectAuditLogs);
export default router;