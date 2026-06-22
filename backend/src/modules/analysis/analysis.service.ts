import prisma from "../../config/database";
import cron from "node-cron";


cron.schedule("*/10 * * * *", async () => {
  const now = new Date();

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
});
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

  const analysis = await prisma.analysis.create({ data });

  await prisma.project.update({
    where: { id: data.projectId },
    data: { status: "active" },
  });

  return analysis;
};


export const deleteAnalysis = async (id: string) => {
  return prisma.analysis.delete({ where: { id } });
};
