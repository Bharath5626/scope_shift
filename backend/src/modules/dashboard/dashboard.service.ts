import prisma from "../../config/database";

export const getDashboard = async (
  projectId: string
) => {
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

export const getOverallDashboardStats = async () => {
  const projects = await prisma.project.findMany({
    include: {
      analyses: true,
    },
  });

  const totalProjects = projects.length;
  const activeProjects = projects.filter((p) => p.status === 'active').length;
  const draftProjects = projects.filter((p) => p.status === 'draft').length;
  const completedProjects = projects.filter((p) => p.status === 'completed').length;

  // Calculate at-risk projects dynamically based on multiple factors
  const today = new Date();
  const atRiskProjects = projects.filter((p) => {
    // Skip completed projects
    if (p.status === 'completed') return false;

    // Factor 1: Deadline proximity (less than 7 days remaining)
    if (p.deadline) {
      const daysUntilDeadline = Math.ceil((new Date(p.deadline).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (daysUntilDeadline <= 7) return true;
    }

    // Factor 2: High or critical risk from latest analysis
    if (p.analyses.length > 0) {
      const latestAnalysis = p.analyses[0];
      if (latestAnalysis.riskLevel && (latestAnalysis.riskLevel.toLowerCase() === 'high' || latestAnalysis.riskLevel.toLowerCase() === 'critical')) return true;
    }

    // Factor 3: High scope increase (more than 30%)
    if (p.analyses.length > 0) {
      const latestAnalysis = p.analyses[0];
      if (latestAnalysis.scopeIncreasePercent > 30) return true;
    }

    return false;
  }).length;

  // Calculate risk distribution from analyses
  const allAnalyses = projects.flatMap((p) => p.analyses);
  const totalAnalyses = allAnalyses.length;

  const riskDistribution = {
    low: allAnalyses.filter((a) => a.riskLevel && a.riskLevel.toLowerCase() === 'low').length,
    medium: allAnalyses.filter((a) => a.riskLevel && a.riskLevel.toLowerCase() === 'medium').length,
    high: allAnalyses.filter((a) => a.riskLevel && a.riskLevel.toLowerCase() === 'high').length,
    critical: allAnalyses.filter((a) => a.riskLevel && a.riskLevel.toLowerCase() === 'critical').length,
  };

  // Calculate scope health score
  const avgScopeIncrease = totalAnalyses > 0
    ? allAnalyses.reduce((sum, a) => sum + a.scopeIncreasePercent, 0) / totalAnalyses
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