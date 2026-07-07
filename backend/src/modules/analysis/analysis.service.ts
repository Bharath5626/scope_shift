import prisma from "../../config/database";
import cron from "node-cron";
import {
  handleDatabaseError,
  getDatabaseErrorStatusCode
} from "../../utils/database-errors";
import {
  logDatabaseTransactionStart,
  logDatabaseTransactionSuccess,
  logDatabaseTransactionRollback,
  logDatabaseAnalysisSaved,
  logDatabaseError,
} from "../../utils/database-logging";
import { generateAnalysisHash } from "../../utils/hash";
import { createAuditLog } from "../auditLogs/auditLog.service";


cron.schedule("*/10 * * * *", async () => {
  const now = new Date();

  try {
    await prisma.project.updateMany({
      where: {
        deadline: { lt: now },
        status: { not: "completed" },
      },
      data: {
        status: "completed",
      },
    });

    console.log("Project status sync completed");
  } catch (error) {
    const dbError = handleDatabaseError(error);
    logDatabaseError('syncProjectStatus', dbError.originalCode, dbError.originalMessage);
  }
});

export const getAnalysesByProject = async (projectId: string, userId: string) => {
  try {
    // Verify project ownership or team membership
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { createdById: userId },
          { projectMembers: { some: { userId } } },
        ],
      },
    });

    if (!project) {
      const error = new Error("Project not found") as Error & { statusCode: number };
      error.statusCode = 404;
      throw error;
    }

    return prisma.analysis.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    throw handleDatabaseError(error);
  }
};

export const getLatestAnalysis = async (projectId: string, userId: string) => {
  try {
    // Verify project ownership or team membership
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { createdById: userId },
          { projectMembers: { some: { userId } } },
        ],
      },
    });

    if (!project) {
      const error = new Error("Project not found") as Error & { statusCode: number };
      error.statusCode = 404;
      throw error;
    }

    return prisma.analysis.findFirst({
      where: { projectId },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    throw handleDatabaseError(error);
  }
};

export const createAnalysis = async (data: {
  projectId: string;
  featureEstimates?: Array<{
    feature: string;
    complexity: string;
    estimatedHours: number;
  }>;
  // Legacy fields (kept for backward compatibility, now optional)
  scopeIncreasePercent?: number;
  additionalHours?: number;
  delayWeeks?: number;
  riskLevel?: string;
  complexity?: string;
  // Capacity engine metrics
  workingDays?: number;
  availableHours?: number;
  productiveHours?: number;
  rawDevelopmentHours?: number;
  testingHours?: number;
  integrationHours?: number;
  documentationHours?: number;
  reworkHours?: number;
  estimatedHours?: number;
  estimatedWeeks?: number;
  capacityUtilization?: number;
  bufferHours?: number;
  bufferPercent?: number;
  timelineFit?: string;
  // Derived metrics
  scopeScore?: number;
  complexityLevel?: string;
  complexityScore?: number;
  projectHealth?: string;
  confidence?: number;
  // JSON fields
  effortBreakdown?: any;
  riskFactors?: any;
  recommendations?: any;
  userId?: string;
  features?: any; // Snapshot of features at analysis time
}) => {
  const startTime = Date.now();
  logDatabaseTransactionStart('createAnalysis', data.projectId);

  // Verify project ownership if userId is provided
  if (data.userId) {
    const project = await prisma.project.findFirst({
      where: {
        id: data.projectId,
        createdById: data.userId,
      },
    });

    if (!project) {
      const error = new Error("Project not found or you don't have permission") as Error & { statusCode: number };
      error.statusCode = 404;
      throw error;
    }
  }

  // Generate analysis hash from feature estimates for duplicate detection
  const analysisHash = data.featureEstimates
    ? generateAnalysisHash(data.featureEstimates)
    : undefined;

  try {
    // Application-level duplicate check for better UX
    if (analysisHash) {
      const existingAnalysis = await prisma.analysis.findFirst({
        where: {
          projectId: data.projectId,
          analysisHash,
        },
      });

      if (existingAnalysis) {
        // Create audit log even for duplicate analysis
        if (data.userId) {
          await createAuditLog({
            projectId: data.projectId,
            action: "analysis_retrieved",
            description: "Existing analysis was retrieved (duplicate scope)",
            userId: data.userId,
          });
        }
        // Return existing analysis instead of creating duplicate
        return existingAnalysis;
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      // Create analysis with all capacity metrics
      // Only include fields that are provided to avoid type errors
      const createData: any = {
        projectId: data.projectId,
        analysisHash,
      };

      // Add optional fields only if they have values
      if (data.scopeIncreasePercent !== undefined) createData.scopeIncreasePercent = data.scopeIncreasePercent;
      if (data.additionalHours !== undefined) createData.additionalHours = data.additionalHours;
      if (data.delayWeeks !== undefined) createData.delayWeeks = data.delayWeeks;
      if (data.riskLevel !== undefined) createData.riskLevel = data.riskLevel;
      if (data.complexity !== undefined) createData.complexity = data.complexity;

      // Capacity engine metrics
      if (data.workingDays !== undefined) createData.workingDays = data.workingDays;
      if (data.availableHours !== undefined) createData.availableHours = data.availableHours;
      if (data.productiveHours !== undefined) createData.productiveHours = data.productiveHours;
      if (data.rawDevelopmentHours !== undefined) createData.rawDevelopmentHours = data.rawDevelopmentHours;
      if (data.testingHours !== undefined) createData.testingHours = data.testingHours;
      if (data.integrationHours !== undefined) createData.integrationHours = data.integrationHours;
      if (data.documentationHours !== undefined) createData.documentationHours = data.documentationHours;
      if (data.reworkHours !== undefined) createData.reworkHours = data.reworkHours;
      if (data.estimatedHours !== undefined) createData.estimatedHours = data.estimatedHours;
      if (data.estimatedWeeks !== undefined) createData.estimatedWeeks = data.estimatedWeeks;
      if (data.capacityUtilization !== undefined) createData.capacityUtilization = data.capacityUtilization;
      if (data.bufferHours !== undefined) createData.bufferHours = data.bufferHours;
      if (data.bufferPercent !== undefined) createData.bufferPercent = data.bufferPercent;
      if (data.timelineFit !== undefined) createData.timelineFit = data.timelineFit;

      // Derived metrics
      if (data.scopeScore !== undefined) createData.scopeScore = data.scopeScore;
      if (data.complexityLevel !== undefined) createData.complexityLevel = data.complexityLevel;
      if (data.complexityScore !== undefined) createData.complexityScore = data.complexityScore;
      if (data.projectHealth !== undefined) createData.projectHealth = data.projectHealth;
      if (data.confidence !== undefined) createData.confidence = data.confidence;

      // JSON fields
      if (data.effortBreakdown !== undefined) createData.effortBreakdown = data.effortBreakdown;
      if (data.riskFactors !== undefined) createData.riskFactors = data.riskFactors;
      if (data.recommendations !== undefined) createData.recommendations = data.recommendations;

      const analysis = await tx.analysis.create({ data: createData });

      // Update project status to active
      await tx.project.update({
        where: { id: data.projectId },
        data: { status: "active" },
      });

      return analysis;
    });

    const duration = Date.now() - startTime;
    logDatabaseTransactionSuccess('createAnalysis', data.projectId, duration);
    logDatabaseAnalysisSaved(data.projectId, result.id);

    // Fetch current features for snapshot
    const currentFeatures = await prisma.feature.findMany({
      where: { projectId: data.projectId },
      orderBy: { order: "asc" },
    });

    console.log('Creating analysis audit log for project:', data.projectId, 'with features:', currentFeatures.length);

    // Create audit log for analysis creation with feature snapshot
    if (data.userId) {
      await createAuditLog({
        projectId: data.projectId,
        action: "analysis_created",
        description: "AI analysis was completed for the project",
        userId: data.userId,
        features: currentFeatures,
      });
      console.log('Analysis audit log created successfully');
    } else {
      console.log('No userId provided, skipping audit log creation');
    }

    return result;
  } catch (error) {
    // Handle P2002 unique constraint violation - return existing analysis if it exists
    const dbError = handleDatabaseError(error);

    console.log('Analysis creation error:', dbError.originalCode, 'analysisHash:', analysisHash);

    // If it's a duplicate analysis error (P2002), try to return the existing analysis
    if (dbError.originalCode === 'P2002' && analysisHash) {
      console.log('Duplicate analysis detected, searching for existing analysis');
      const existingAnalysis = await prisma.analysis.findFirst({
        where: {
          projectId: data.projectId,
          analysisHash,
        },
      });

      if (existingAnalysis) {
        console.log('Found existing analysis:', existingAnalysis.id);
        
        // Fetch current features for snapshot
        const currentFeatures = await prisma.feature.findMany({
          where: { projectId: data.projectId },
          orderBy: { order: "asc" },
        });

        console.log('Analysis retrieved - features found:', currentFeatures.length);
        console.log('Sample feature:', currentFeatures[0]);

        // Create audit log for analysis retrieval with feature snapshot
        if (data.userId) {
          await createAuditLog({
            projectId: data.projectId,
            action: "analysis_retrieved",
            description: "Existing analysis was retrieved (duplicate scope)",
            userId: data.userId,
            features: currentFeatures,
          });
          console.log('Analysis retrieved audit log created');
        }

        return existingAnalysis;
      }
    }

    logDatabaseTransactionRollback('createAnalysis', data.projectId, dbError.originalCode, dbError.originalMessage);
    throw dbError;
  }
};


export const deleteAnalysis = async (id: string, userId: string) => {
  try {
    // Verify analysis ownership through project relationship
    const analysis = await prisma.analysis.findFirst({
      where: {
        id,
        project: {
          createdById: userId,
        },
      },
    });

    if (!analysis) {
      const error = new Error("Analysis not found") as Error & { statusCode: number };
      error.statusCode = 404;
      throw error;
    }

    return prisma.analysis.delete({ where: { id } });
  } catch (error) {
    throw handleDatabaseError(error);
  }
};
