import prisma from "../../config/database";

export const getDashboard = async (
  projectId: string
) => {
  const analysisRuns =
    await prisma.analysisRun.findMany({
      where: {
        projectId,
      },
      include: {
        featureChanges: true,
        risks: true,
        reports: true,
      },
    });

  const totalRuns = analysisRuns.length;

  const totalChanges = analysisRuns.reduce(
    (sum, run) => sum + run.featureChanges.length,
    0
  );

  const totalRisks = analysisRuns.reduce(
    (sum, run) => sum + run.risks.length,
    0
  );

  const highRisks = analysisRuns.reduce(
    (sum, run) =>
      sum +
      run.risks.filter(
        (risk) => risk.severity === "HIGH"
      ).length,
    0
  );

  const latestRun = analysisRuns[0];

  return {
    totalRuns,
    totalChanges,
    totalRisks,
    highRisks,
    latestReport:
      latestRun?.reports?.[0] ?? null,
  };
};