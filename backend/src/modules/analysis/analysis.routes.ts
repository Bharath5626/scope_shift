import { Router } from "express";
import * as controller from "./analysis.controller";
import { validate } from "../../middlewares/validate.middleware";
import { createAnalysisSchema } from "./analysis.validation";

const router = Router({ mergeParams: true });

router.get("/", controller.getAnalysesByProject);
router.get("/latest", controller.getLatestAnalysis);
router.post("/", validate(createAnalysisSchema), controller.createAnalysis);
router.delete("/:id", controller.deleteAnalysis);

export default router;
