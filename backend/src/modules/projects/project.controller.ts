import { Request, Response } from "express";
import * as ProjectService from "./project.service";
import { asyncHandler } from "../../utils/asyncHandler";

export const createProject = asyncHandler(async (req: Request, res: Response) => {
 const {
  name,
  description,
  type,
  projectType,
  startDate,
  deadline,
  teamSize,
  techStack,
  methodology,
  workingHours,
  logo,
  teamMembers,
} = req.body;

 const project =await ProjectService.createProject(
  {
    name,
    description,
    type,
    projectType,
    startDate,
    deadline,
    teamSize,
    techStack,
    methodology,
    workingHours,
    logo,
    teamMembers,
  },
  req.user!.id
);

  res.status(201).json({
    success: true,
    data: project,
  });
});

export const getProjects = asyncHandler(async (req: Request, res: Response) => {
  const projects = await ProjectService.getProjects(req.user!.id);
  res.json({ success: true, data: projects });
});

export const getProjectById = asyncHandler(async (req: Request, res: Response) => {
  const project = await ProjectService.getProjectById(req.params.id, req.user!.id);
  if (!project) {
    return res.status(404).json({ success: false, message: "Project not found" });
  }
  res.json({ success: true, data: project });
});

export const updateProject = asyncHandler(async (req: Request, res: Response) => {
  const { teamMembers, ...otherData } = req.body;
  const project = await ProjectService.updateProject(req.params.id, { ...otherData, teamMembers }, req.user!.id);
  res.json({ success: true, data: project });
});

export const deleteProject = asyncHandler(async (req: Request, res: Response) => {
  await ProjectService.deleteProject(req.params.id, req.user!.id);
  res.json({ success: true, message: "Project deleted successfully" });
});

export const getAnalyzedProjects = asyncHandler(async (req: Request, res: Response) => {
  const projects = await ProjectService.getAnalyzedProjects(req.user!.id);
  res.json({ success: true, data: projects });
});

