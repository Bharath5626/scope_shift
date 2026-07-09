import { Router, Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import * as aiService from "./ai.service";
import { getProjectById, createProjectWithFeatures } from "../projects/project.service";
import { createAnalysis } from "../analysis/analysis.service";
import prisma from "../../config/database";
import { handleDatabaseError } from "../../utils/database-errors";
import { createAuditLog } from "../auditLogs/auditLog.service";
import { verifyToken } from "../../middlewares/auth.middleware";

const router = Router({ mergeParams: true });
router.use(verifyToken);

router.post(
  "/analyze",
  asyncHandler(async (req: Request, res: Response) => {
    const { projectId } = req.params;

    const project = await getProjectById(projectId, req.user!.id);
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

    const { analyzeProjectScope } = aiService;

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
      featureEstimates: originalFeatures.map(f => ({
        feature: f.title,
        complexity: 'Medium', // Will be updated by AI
        estimatedHours: 0, // Will be updated by AI
      })),
      scopeIncreasePercent: result.scopeScore,
      additionalHours: result.estimatedHours,
      delayWeeks: result.estimatedWeeks,
      workingDays: result.availableHours ? Math.floor(result.availableHours / (project.workingHours || 8)) : undefined,
      availableHours: result.availableHours,
      productiveHours: result.effectiveAvailableHours,
      estimatedHours: result.estimatedHours,
      estimatedWeeks: result.estimatedWeeks,
      capacityUtilization: result.capacityUtilization,
      bufferHours: result.capacityBuffer,
      bufferPercent: result.capacityBufferPercent,
      timelineFit: result.deadlineFeasible ? 'ON_TRACK' : 'OVER_CAPACITY',
      scopeScore: result.scopeScore,
      complexityLevel: result.complexity.level,
      complexityScore: result.complexity.score,
      riskLevel: result.riskLevel,
      projectHealth: result.projectHealth,
      confidence: result.confidence,
      effortBreakdown: result.effortBreakdown,
      riskFactors: result.riskFactors,
      recommendations: result.recommendations,
      userId: req.user?.id,
    });

    res.status(201).json({ success: true, data: result });
  }),
);

router.post(
  "/generate-features",
  asyncHandler(async (req: Request, res: Response) => {
    const { projectId } = req.params;

    const project = await getProjectById(projectId, req.user!.id);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    // Use all project details from database
    const suggestions = await aiService.generateProjectFeatures({
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

    // Fetch all features after creation for snapshot
    const allFeatures = await prisma.feature.findMany({
      where: { projectId },
      orderBy: { order: "asc" },
    });

    // Create audit log for feature generation
    if (req.user?.id) {
      await createAuditLog({
        projectId,
        action: "features_generated",
        description: `Generated ${created.length} new features for the project`,
        userId: req.user.id,
        features: allFeatures,
      });
    }

    res.status(201).json({ success: true, data: created });
  }),
);

// NEW: Create project with AI-generated features in a single transaction
router.post(
  "/create-with-features",
  asyncHandler(async (req: Request, res: Response) => {
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
    } = req.body;

    // Step 1: Call Gemini to generate features BEFORE creating project
    let features;
    try {
      features = await aiService.generateProjectFeatures({
        name,
        description,
        type,
        techStack,
        teamSize: teamSize ? String(teamSize) : undefined,
        methodology,
        experienceLevel: undefined,
        deadline,
        workingHours,
        startDate,
        projectType,
      });
    } catch (error) {
      // If Gemini fails, return error without creating project
      const errorMessage = error instanceof Error ? error.message : 'AI feature generation failed';
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to generate features',
        error: errorMessage 
      });
    }

    // Step 2: Create project and features in a single transaction
    try {
      const project = await createProjectWithFeatures(
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
        },
        req.user!.id,
        features.map(f => ({
          title: f.title,
          description: f.description,
          category: f.category,
          priority: f.priority,
        }))
      );

      res.status(201).json({ success: true, data: project });
    } catch (error) {
      throw handleDatabaseError(error);
    }
  }),
);

export default router;
