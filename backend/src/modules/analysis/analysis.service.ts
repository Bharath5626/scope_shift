import prisma from "../../config/database";

export const getAnalysesByProject = async (projectId: string) => {
  return prisma.analysis.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
  });
};

export const getLatestAnalysis = async (projectId: string) => {
  return prisma.analysis.findFirst({
    where: { projectId },
    orderBy: { createdAt: "desc" },
  });
};

export const createAnalysis = async (data: {
  projectId: string;
  scopeIncreasePercent: number;
  additionalHours: number;
  delayWeeks: number;
  riskLevel: string;
  complexity: string;
}) => {
  return prisma.analysis.create({ data });
};

export const deleteAnalysis = async (id: string) => {
  return prisma.analysis.delete({ where: { id } });
};
