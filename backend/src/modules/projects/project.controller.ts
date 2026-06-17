import { Request, Response } from "express";
import * as ProjectService from "./project.service";
import { createProjectSchema } from "./project.validation";
import { asyncHandler } from "../../utils/asyncHandler";

export const createProject = asyncHandler(
  async (req: Request, res: Response) => {
    const project = await ProjectService.createProject(req.body);

    res.status(201).json({
      success: true,
      data: project,
    });
  }
);

export const getProjects = asyncHandler(
  async (req: Request, res: Response) => {
    const projects = await ProjectService.getProjects();

    res.json({
      success: true,
      data: projects,
    });
  }
);

export const getProjectById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const project = await ProjectService.getProjectById(id);

    res.json({
      success: true,
      data: project,
    });
  }
);
export const deleteProject = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    await ProjectService.deleteProject(id);

    res.json({
      success: true,
      message: "Project deleted successfully",
    });
  }
);