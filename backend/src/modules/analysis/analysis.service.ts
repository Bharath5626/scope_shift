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

export const getAnalysesByProject = async (projectId: string) => {
  try {
    return prisma.analysis.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    throw handleDatabaseError(error);
  }
};

export const getLatestAnalysis = async (projectId: string) => {
  try {
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
}) => {
  const startTime = Date.now();
  logDatabaseTransactionStart('createAnalysis', data.projectId);

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

    return result;
  } catch (error) {
    // Handle P2002 unique constraint violation - return existing analysis if it exists
    const dbError = handleDatabaseError(error);
    
    // If it's a duplicate analysis error (P2002), try to return the existing analysis
    if (dbError.originalCode === 'P2002' && analysisHash) {
      const existingAnalysis = await prisma.analysis.findFirst({
        where: {
          projectId: data.projectId,
          analysisHash,
        },
      });
      
      if (existingAnalysis) {
        return existingAnalysis;
      }
    }
    
    logDatabaseTransactionRollback('createAnalysis', data.projectId, dbError.originalCode, dbError.originalMessage);
    throw dbError;
  }
};


export const deleteAnalysis = async (id: string) => {
  try {
    return prisma.analysis.delete({ where: { id } });
  } catch (error) {
    throw handleDatabaseError(error);
  }
};
