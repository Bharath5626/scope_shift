import { Request, Response } from "express";
import * as service from "./dashboard.service";

export const getDashboard = async (
  req: Request,
  res: Response
) => {
  const data = await service.getDashboard(
    req.params.projectId,
    req.user!.id
  );

  res.json({
    success: true,
    data,
  });
};

export const getOverallDashboardStats = async (
  req: Request,
  res: Response
) => {
  const data = await service.getOverallDashboardStats(req.user!.id);

  res.json({
    success: true,
    data,
  });
};