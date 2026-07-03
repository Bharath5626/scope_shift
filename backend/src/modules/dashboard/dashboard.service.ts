import prisma from "../../config/database";

export const getDashboard = async (
  projectId: string,
  userId: string
) => {
  // Verify project ownership
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      createdById: userId,
    },
  });

  if (!project) {
    const error = new Error("Project not found") as Error & { statusCode: number };
    error.statusCode = 404;
    throw error;
  }

  const analyses = await prisma.analysis.findMany({
    where: {
      projectId,
    },
  });

  const totalRuns = analyses.length;
  const totalChanges = analyses.length;
  const totalRisks = analyses.filter((a) => a.riskLevel && (a.riskLevel === 'high' || a.riskLevel === 'critical')).length;
  const highRisks = analyses.filter((a) => a.riskLevel === 'high').length;

  const latestRun = analyses[0];

  return {
    totalRuns,
    totalChanges,
    totalRisks,
    highRisks,
    latestReport: latestRun ?? null,
  };
};

export const getOverallDashboardStats = async (userId: string) => {
  const projects = await prisma.project.findMany({
    where: {
      createdById: userId,
    },
    include: {
      analyses: true,
    },
  });

  const totalProjects = projects.length;
  const activeProjects = projects.filter((p) => p.status === 'active').length;
  const draftProjects = projects.filter((p) => p.status === 'draft').length;
  const completedProjects = projects.filter((p) => p.status === 'completed').length;

  // Calculate at-risk projects based on deadline proximity only
  const today = new Date();
  const atRiskProjects = projects.filter((p) => {
    // Skip completed projects
    if (p.status === 'completed') return false;

    // Only consider deadline proximity (less than 7 days remaining)
    if (p.deadline) {
      const daysUntilDeadline = Math.ceil((new Date(p.deadline).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilDeadline <= 7;
    }

    return false;
  }).length;

  // Get only the latest analysis from each project
  const latestAnalyses = projects
    .map((p) => {
      if (p.analyses.length > 0) {
        // Sort by createdAt desc and take the first one
        return p.analyses.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
      }
      return null;
    })
    .filter((a) => a !== null);

  // Calculate risk distribution from latest analyses only
  const totalAnalyses = latestAnalyses.length;

  const riskDistribution = {
    low: latestAnalyses.filter((a) => a!.riskLevel && a!.riskLevel.toLowerCase() === 'low').length,
    medium: latestAnalyses.filter((a) => a!.riskLevel && a!.riskLevel.toLowerCase() === 'medium').length,
    high: latestAnalyses.filter((a) => a!.riskLevel && a!.riskLevel.toLowerCase() === 'high').length,
    critical: latestAnalyses.filter((a) => a!.riskLevel && a!.riskLevel.toLowerCase() === 'critical').length,
  };

  // Calculate scope health score
  const avgScopeIncrease = totalAnalyses > 0
    ? latestAnalyses.reduce((sum: number, a: any) => sum + (a.scopeIncreasePercent || 0), 0) / totalAnalyses
    : 0;

  const healthScore = Math.max(0, Math.min(100, 100 - avgScopeIncrease));

  // Get recent projects
  const recentProjects = [...projects]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  // Get upcoming deadlines
  const upcomingDeadlines = projects
    .filter((p) => p.deadline && new Date(p.deadline) > today && p.status !== 'completed')
    .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())
    .slice(0, 3);

  return {
    stats: {
      totalProjects,
      activeProjects,
      draftProjects,
      completedProjects,
      atRiskProjects,
    },
    scopeHealth: {
      healthScore: Math.round(healthScore),
      totalAnalyses,
      warnings: riskDistribution.high + riskDistribution.critical,
      healthy: riskDistribution.low + riskDistribution.medium,
    },
    riskDistribution: {
      low: riskDistribution.low,
      medium: riskDistribution.medium,
      high: riskDistribution.high,
      critical: riskDistribution.critical,
      total: totalAnalyses,
    },
    recentProjects,
    upcomingDeadlines,
  };
};