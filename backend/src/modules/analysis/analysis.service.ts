import prisma from "../../config/database";

import { analyzeScopeChanges } from "../ai/ai.service";

type AnalyzeScopeChangesResult = {
  featureChanges?: Array<{
    title: string;
    impactScore?: number;
    featureId?: string;
    changeType?: string;
    explanation?: string;
  }>;
  risks?: Array<{
    title: string;
    description?: string;
    severity: string;
  }>;
  recommendations?: Array<{
    title: string;
    description?: string;
    priority?: string;
  }>;
  report?: {
    reportType?: string;
    summary?: string;
  };
};
export const getAnalysisRunDetails = async (
  analysisRunId: string
) => {
  return prisma.analysisRun.findUnique({
    where: {
      id: analysisRunId,
    },
    include: {
      featureChanges: true,
      risks: true,
      recommendations: true,
      reports: true,
    },
  });
};
export const runAnalysis = async (
  data: {
    projectId: string;
    oldVersionId: string;
    newVersionId: string;
  }
) => {
  const { projectId, oldVersionId, newVersionId } = data;

  const oldVersion = await prisma.scopeVersion.findUnique({
    where: { id: oldVersionId },
    include: { features: true },
  });

  const newVersion = await prisma.scopeVersion.findUnique({
    where: { id: newVersionId },
    include: { features: true },
  });

  if (!oldVersion || !newVersion) {
    throw new Error("Scope version not found");
  }

  const originalScope = oldVersion.features.map((f) => f.title);
  const updatedScope = newVersion.features.map((f) => f.title);

  const aiResult = (await (analyzeScopeChanges as any)({
    originalScope,
    updatedScope,
  })) as AnalyzeScopeChangesResult;

  const analysis = await prisma.$transaction(async (tx) => {
    const analysisRun = await tx.analysisRun.create({
      data: {
        projectId,
        status: "COMPLETED",
      },
    });

    const fallbackFeature = await tx.feature.findFirst({
      where: {
        scopeVersion: {
          projectId,
        },
      },
      select: {
        id: true,
      },
    });

    const featureId = fallbackFeature?.id;

    if (featureId) {
      await Promise.all(
        (aiResult.featureChanges ?? []).map((featureChange) =>
          tx.featureChange.create({
            data: {
              analysisRunId: analysisRun.id,
              featureId,
              changeType:
                featureChange.changeType ?? "UPDATED",
              impactScore: featureChange.impactScore,
              explanation:
                featureChange.explanation ??
                featureChange.title,
            },
          })
        )
      );
    }

    await Promise.all(
      (aiResult.risks ?? []).map((risk) =>
        tx.risk.create({
          data: {
            analysisRunId: analysisRun.id,
            title: risk.title,
            description: risk.description ?? risk.title,
            severity: risk.severity,
          },
        })
      )
    );

    await Promise.all(
      (aiResult.recommendations ?? []).map((recommendation) =>
        tx.recommendation.create({
          data: {
            analysisRunId: analysisRun.id,
            title: recommendation.title,
            description:
              recommendation.description ?? recommendation.title,
            priority: recommendation.priority,
          },
        })
      )
    );

    if (aiResult.report) {
      await tx.report.create({
        data: {
          analysisRunId: analysisRun.id,
          reportType: aiResult.report.reportType ?? "ANALYSIS",
          summary: aiResult.report.summary,
        },
      });
    }

    return analysisRun;
  });

  return {
    analysisRun: analysis,
    aiResult,
  };
};

export const getAnalysisRuns = async (
  projectId: string
) => {
  return prisma.analysisRun.findMany({
    where: {
      projectId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getReportByAnalysisId = async (
  analysisRunId: string
) => {
  return prisma.report.findMany({
    where: { analysisRunId },
  });
};

export const getRisksByAnalysisId = async (
  analysisRunId: string
) => {
  return prisma.risk.findMany({
    where: { analysisRunId },
  });
};

export const getRecommendationsByAnalysisId = async (
  analysisRunId: string
) => {
  return prisma.recommendation.findMany({
    where: { analysisRunId },
  });
};

export const getChangesByAnalysisId = async (
  analysisRunId: string
) => {
  return prisma.featureChange.findMany({
    where: { analysisRunId },
  });
};