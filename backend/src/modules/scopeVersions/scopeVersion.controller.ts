import { Request, Response } from "express";
import * as ScopeVersionService from "./scopeVersion.service";
import { asyncHandler } from "../../utils/asyncHandler";

export const createScopeVersion = asyncHandler(
  async (req: Request, res: Response) => {
    const scopeVersion =
      await ScopeVersionService.createScopeVersion({
        ...req.body,
        userId: req.user!.id,
      });

    res.status(201).json({
      success: true,
      data: scopeVersion,
    });
  }
);

export const getScopeVersionsByProject = asyncHandler(
  async (req: Request, res: Response) => {
    const projectId = req.params.projectId as string;;

    const versions =
      await ScopeVersionService.getScopeVersionsByProject(
        projectId,
        req.user!.id
      );

    res.json({
      success: true,
      data: versions,
    });
  }
);

export const getScopeVersionById = asyncHandler(
  async (req: Request, res: Response) => {
    const version =
      await ScopeVersionService.getScopeVersionById(
        req.params.id as string,
        req.user!.id
      );

    res.json({
      success: true,
      data: version,
    });
  }
);

export const deleteScopeVersion = asyncHandler(
  async (req: Request, res: Response) => {
    await ScopeVersionService.deleteScopeVersion(
          req.params.id as string,
          req.user!.id
    );

    res.json({
      success: true,
      message: "Deleted successfully",
    });
  }
);