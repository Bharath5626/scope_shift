import { Request, Response } from "express";
import * as ProjectService from "./project.service";
import { asyncHandler } from "../../utils/asyncHandler";

export const createProject = asyncHandler(async (req: Request, res: Response) => {
  const project = await ProjectService.createProject(req.body);
  res.status(201).json({ success: true, data: project });
});

export const getProjects = asyncHandler(async (req: Request, res: Response) => {
  const projects = await ProjectService.getProjects();
  res.json({ success: true, data: projects });
});

export const getProjectById = asyncHandler(async (req: Request, res: Response) => {
  const project = await ProjectService.getProjectById(req.params.id);
  if (!project) {
    return res.status(404).json({ success: false, message: "Project not found" });
  }
  res.json({ success: true, data: project });
});

export const updateProject = asyncHandler(async (req: Request, res: Response) => {
  const project = await ProjectService.updateProject(req.params.id, req.body);
  res.json({ success: true, data: project });
});

export const deleteProject = asyncHandler(async (req: Request, res: Response) => {
  await ProjectService.deleteProject(req.params.id);
  res.json({ success: true, message: "Project deleted successfully" });
});
