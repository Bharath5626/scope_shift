import { Request, Response } from "express";
import * as AnalysisService from "./analysis.service";
import { asyncHandler } from "../../utils/asyncHandler";

export const runAnalysis = asyncHandler(
  async (req: Request, res: Response) => {
    const analysis = await AnalysisService.runAnalysis(req.body);

    res.status(201).json({
      success: true,
      data: analysis,
    });
  }
);
export const getAnalysisRunDetails = asyncHandler(
  async (req: Request, res: Response) => {
    const data = await AnalysisService.getAnalysisRunDetails(
      req.params.id
    );

    res.status(200).json({
      success: true,
      data,
    });
  }
);
export const getAnalysisRuns = asyncHandler(
  async (req: Request, res: Response) => {
    const analyses =
      await AnalysisService.getAnalysisRuns(
        req.params.projectId
      );

    res.json({
      success: true,
      data: analyses,
    });
  }
);

export const getReportByAnalysisId = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const reports = await AnalysisService.getReportByAnalysisId(id);

    res.json({
      success: true,
      data: reports,
    });
  }
);

export const getRisksByAnalysisId = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const risks = await AnalysisService.getRisksByAnalysisId(id);

    res.json({
      success: true,
      data: risks,
    });
  }
);

export const getRecommendationsByAnalysisId = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const recommendations = await AnalysisService.getRecommendationsByAnalysisId(id);

    res.json({
      success: true,
      data: recommendations,
    });
  }
);

export const getChangesByAnalysisId = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const changes = await AnalysisService.getChangesByAnalysisId(id);

    res.json({
      success: true,
      data: changes,
    });
  }
);