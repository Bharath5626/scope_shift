import { Router } from "express";
import * as controller from "./analysis.controller";
import { validate } from "../../middlewares/validate.middleware";
import { createAnalysisSchema } from "./analysis.validation";
import { verifyToken } from "../../middlewares/auth.middleware";

const router = Router({ mergeParams: true });
router.use(verifyToken);

router.get("/", controller.getAnalysesByProject);
router.get("/latest", controller.getLatestAnalysis);
router.post("/", validate(createAnalysisSchema), controller.createAnalysis);
router.delete("/:id", controller.deleteAnalysis);

export default router;
