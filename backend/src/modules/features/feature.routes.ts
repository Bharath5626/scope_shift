import { Router } from "express";
import * as controller from "./feature.controller";
import { validate } from "../../middlewares/validate.middleware";
import { createFeatureSchema, updateFeatureSchema, reorderSchema } from "./feature.validation";

const router = Router({ mergeParams: true });

router.get("/", controller.getFeaturesByProject);
router.post("/", validate(createFeatureSchema), controller.addFeature);
router.put("/reorder", validate(reorderSchema), controller.reorderFeatures);
router.put("/:id", validate(updateFeatureSchema), controller.updateFeature);
router.delete("/:id", controller.deleteFeature);

export default router;
