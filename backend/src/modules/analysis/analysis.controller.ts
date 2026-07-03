import { Request, Response } from "express";
import * as AnalysisService from "./analysis.service";
import { asyncHandler } from "../../utils/asyncHandler";

export const getAnalysesByProject = asyncHandler(async (req: Request, res: Response) => {
  const analyses = await AnalysisService.getAnalysesByProject(req.params.projectId, req.user!.id);
  res.json({ success: true, data: analyses });
});

export const getLatestAnalysis = asyncHandler(async (req: Request, res: Response) => {
  const analysis = await AnalysisService.getLatestAnalysis(req.params.projectId, req.user!.id);
  res.json({ success: true, data: analysis });
});

export const createAnalysis = asyncHandler(async (req: Request, res: Response) => {
  const analysis = await AnalysisService.createAnalysis({
    projectId: req.params.projectId,
    ...req.body,
    userId: req.user!.id,
  });
  res.status(201).json({ success: true, data: analysis });
});

export const deleteAnalysis = asyncHandler(async (req: Request, res: Response) => {
  await AnalysisService.deleteAnalysis(req.params.id, req.user!.id);
  res.json({ success: true, message: "Analysis deleted successfully" });
});
