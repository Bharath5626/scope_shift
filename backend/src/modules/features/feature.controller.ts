import { Request, Response } from "express";
import * as FeatureService from "./feature.service";
import { asyncHandler } from "../../utils/asyncHandler";

export const getFeaturesByProject = asyncHandler(async (req: Request, res: Response) => {
  const { projectId } = req.params;
  const type = req.query.type as string | undefined;
  const features = await FeatureService.getFeaturesByProject(projectId, type);
  res.json({ success: true, data: features });
});

export const addFeature = asyncHandler(async (req: Request, res: Response) => {
  const { projectId } = req.params;
  const feature = await FeatureService.addFeature(projectId, req.body);
  res.status(201).json({ success: true, data: feature });
});

export const updateFeature = asyncHandler(async (req: Request, res: Response) => {
  const feature = await FeatureService.updateFeature(req.params.id, req.body);
  res.json({ success: true, data: feature });
});

export const deleteFeature = asyncHandler(async (req: Request, res: Response) => {
  await FeatureService.deleteFeature(req.params.id);
  res.json({ success: true, message: "Feature deleted successfully" });
});

export const reorderFeatures = asyncHandler(async (req: Request, res: Response) => {
  const { projectId } = req.params;
  const { orderedIds } = req.body;
  await FeatureService.reorderFeatures(projectId, orderedIds);
  res.json({ success: true, message: "Features reordered successfully" });
});
