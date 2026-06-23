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
const errorCount = analysisRuns.filter(run => run.error).length;
  const totalChanges = analysisRuns.reduce(
    (sum: any, run: { featureChanges: string | any[]; }) => sum + run.featureChanges.length,
    0
  );

  const totalRisks = analysisRuns.reduce(
    (sum: any, run: { risks: string | any[]; }) => sum + run.risks.length,
    0
  );

  const highRisks = analysisRuns.reduce(
    (sum: any, run: { risks: { filter: (arg0: (risk: { severity: string; }) => boolean) => { (): any; new(): any; length: any; }; }; }) =>
      sum +
      run.risks.filter(
        (risk: { severity: string; }) => risk.severity === "HIGH"
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