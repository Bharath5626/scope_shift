import { Request, Response } from "express";
import * as service from "./dashboard.service";

export const getDashboard = async (
  req: Request,
  res: Response
) => {
  const data = await service.getDashboard(
    req.params.projectId
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
  const data = await service.getOverallDashboardStats();

  res.json({
    success: true,
    data,
  });
};