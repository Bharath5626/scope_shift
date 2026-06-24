import { Router, Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { generateProjectFeatures } from "./ai.service";
import { getProjectById } from "../projects/project.service";
import prisma from "../../config/database";

const router = Router({ mergeParams: true });

router.post(
  "/analyze",
  asyncHandler(async (req: Request, res: Response) => {
    const { projectId } = req.params;

    const project = await getProjectById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    const [originalFeatures, newFeatures] = await Promise.all([
      prisma.feature.findMany({
        where: { projectId, type: "original" },
        orderBy: { order: "asc" },
      }),
      prisma.feature.findMany({
        where: { projectId, type: "new" },
        orderBy: { order: "asc" },
      }),
    ]);

    const { analyzeProjectScope } = await import("./ai.service");
    const { createAnalysis } = await import("../analysis/analysis.service");

    // Use all project details from database for analysis
    const projectInfo = {
      name: project.name,
      description: project.description,
      type: project.type,
      techStack: project.techStack ?? undefined,
      teamSize: project.teamSize ? String(project.teamSize) : undefined,
      methodology: project.methodology ?? undefined,
      startDate: project.startDate ? project.startDate.toISOString().split('T')[0] : undefined,
      deadline: project.deadline ? project.deadline.toISOString().split('T')[0] : undefined,
      workingHours: project.workingHours ? String(project.workingHours) : undefined,
      projectType: project.projectType ?? undefined,
    };

    const result = newFeatures.length > 0
      ? await analyzeProjectScope(projectInfo, originalFeatures, newFeatures)
      : await analyzeProjectScope(projectInfo, originalFeatures, []);

    await createAnalysis({
      projectId,
      scopeIncreasePercent: result.scopeScore,
      additionalHours: result.estimatedHours,
      delayWeeks: result.estimatedWeeks,
      riskLevel: result.riskLevel,
      complexity: result.complexity.level,
    });

    res.status(201).json({ success: true, data: result });
  }),
);

router.post(
  "/generate-features",
  asyncHandler(async (req: Request, res: Response) => {
    const { projectId } = req.params;

    const project = await getProjectById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    // Use all project details from database
    const suggestions = await generateProjectFeatures({
      name: project.name,
      description: project.description ?? undefined,
      type: project.type,
      techStack: project.techStack ?? undefined,
      teamSize: project.teamSize ? String(project.teamSize) : undefined,
      methodology: project.methodology ?? undefined,
      experienceLevel: undefined, // Not stored in DB
      deadline: project.deadline ? project.deadline.toISOString().split('T')[0] : undefined,
      workingHours: project.workingHours ? String(project.workingHours) : undefined,
      startDate: project.startDate ? project.startDate.toISOString().split('T')[0] : undefined,
      projectType: project.projectType ?? undefined,
    });

    const existingCount = await prisma.feature.count({ where: { projectId } });

    const created = await prisma.$transaction(
      suggestions.map((f, i) =>
        prisma.feature.create({
          data: {
            projectId,
            title: f.title,
            description: f.description,
            category: f.category,
            priority: f.priority,
            type: "original",
            order: existingCount + i,
          },
        }),
      ),
    );

    res.status(201).json({ success: true, data: created });
  }),
);

export default router;
