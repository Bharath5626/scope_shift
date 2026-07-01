import { Router } from "express";
import { getProjectAuditLogs } from "./auditLog.controller";
import { verifyToken } from "../../middlewares/auth.middleware";

const router = Router();

router.get("/audit-logs", verifyToken, getProjectAuditLogs);

export default router;
