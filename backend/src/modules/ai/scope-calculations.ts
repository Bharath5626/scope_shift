/**
 * Pure calculation functions for scope analysis metrics.
 * These functions are deterministic and testable without external dependencies.
 */

export interface FeatureEstimate {
  feature: string;
  complexity: "Simple" | "Medium" | "Complex" | "Very Complex";
  estimatedHours: number;
}

export interface CapacityInput {
  teamSize: number;
  workingHoursPerDay: number;
  startDate: Date;
  deadline: Date;
  featureEstimates: FeatureEstimate[];
}

export interface CapacityMetrics {
  workingDays: number;
  availableHours: number;
  productiveHours: number;
  rawDevelopmentHours: number;
  testingHours: number;
  integrationHours: number;
  documentationHours: number;
  reworkHours: number;
  estimatedHours: number;
  estimatedWeeks: number;
  capacityUtilization: number;
  bufferHours: number;
  bufferPercent: number;
  timelineFit: "ON_TRACK" | "AT_RISK" | "OVER_CAPACITY";
}

// Legacy types for backward compatibility
export interface CapacityMetricsInput {
  teamSize: number;
  workingHoursPerDay: number;
  workingDays: number;
  estimatedHours: number;
  complexityScore: number;
}

export interface CapacityMetricsOutput {
  availableHours: number;
  effectiveAvailableHours: number;
  estimatedWeeks: number;
  capacityUtilization: number;
  capacityBuffer: number;
  capacityBufferPercent: number;
  deadlineFeasible: boolean;
}

export interface RiskLevelInput {
  capacityUtilization: number;
  complexityScore: number;
  deadlineFeasible: boolean;
}

export interface ProjectHealthInput {
  capacityBufferPercent: number;
}

export interface ConfidenceInput {
  complexityScore: number;
  riskFactorCount: number;
}

/**
 * Calculate working days between two dates (excluding weekends, including both dates).
 */
export function calculateWorkingDays(startDate: Date, endDate: Date): number {
  if (startDate > endDate) {
    throw new Error("Start date must be before or equal to end date");
  }

  let workingDays = 0;
  let currentDate = new Date(startDate);
  const endDateCopy = new Date(endDate);

  // Include both start and end dates
  while (currentDate <= endDateCopy) {
    const dayOfWeek = currentDate.getDay();
    // 0 = Sunday, 6 = Saturday
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      workingDays++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // If no working days found (e.g., entire range is weekends), reject
  if (workingDays === 0) {
    throw new Error("Project range must include at least one working day");
  }

  return workingDays;
}

/**
 * Calculate efficiency factor based on complexity score.
 */
export function calculateEfficiency(complexityScore: number): number {
  if (complexityScore >= 70) return 0.55;
  if (complexityScore >= 45) return 0.65;
  return 0.75;
}

/**
 * New capacity calculation engine - deterministic, no AI involvement.
 * Backend is the single source of truth for all timeline calculations.
 */
export function calculateCapacityMetricsNew(input: CapacityInput): CapacityMetrics {
  const { teamSize, workingHoursPerDay, startDate, deadline, featureEstimates } = input;

  // Validation
  if (teamSize <= 0) {
    throw new Error("Team size must be a positive number");
  }
  if (workingHoursPerDay <= 0) {
    throw new Error("Working hours per day must be a positive number");
  }
  if (isNaN(startDate.getTime())) {
    throw new Error("Invalid start date");
  }
  if (isNaN(deadline.getTime())) {
    throw new Error("Invalid deadline date");
  }
  if (deadline < startDate) {
    throw new Error("Deadline cannot be before start date");
  }
  if (!Array.isArray(featureEstimates) || featureEstimates.length === 0) {
    throw new Error("Feature estimates must be a non-empty array");
  }

  // Step 2: Calculate working days
  const workingDays = calculateWorkingDays(startDate, deadline);

  // Step 3: Calculate available hours
  const availableHours = workingDays * workingHoursPerDay * teamSize;

  // Step 4: Apply productivity adjustment (25% reduction)
  const productiveHours = Math.round(availableHours * 0.75);

  // Step 5: Sum feature development effort
  const rawDevelopmentHours = featureEstimates.reduce(
    (sum, estimate) => sum + (Number(estimate.estimatedHours) || 0),
    0
  );

  // Step 6: Add engineering overhead
  const testingHours = Math.round(rawDevelopmentHours * 0.20);
  const integrationHours = Math.round(rawDevelopmentHours * 0.15);
  const documentationHours = Math.round(rawDevelopmentHours * 0.05);
  const reworkHours = Math.round(rawDevelopmentHours * 0.10);
  const estimatedHours = rawDevelopmentHours + testingHours + integrationHours + documentationHours + reworkHours;

  // Step 7: Calculate capacity utilization
  const capacityUtilization = productiveHours > 0
    ? Math.round((estimatedHours / productiveHours) * 100)
    : 0;

  // Step 8: Calculate buffer
  const bufferHours = productiveHours - estimatedHours;
  const bufferPercent = productiveHours > 0
    ? Math.round((bufferHours / productiveHours) * 100)
    : 0;

  // Step 9: Determine timeline fit
  let timelineFit: "ON_TRACK" | "AT_RISK" | "OVER_CAPACITY";
  if (bufferPercent > 20) {
    timelineFit = "ON_TRACK";
  } else if (bufferPercent >= 0) {
    timelineFit = "AT_RISK";
  } else {
    timelineFit = "OVER_CAPACITY";
  }

  // Step 10: Calculate estimated weeks (35 productive hours per developer per week)
  const productiveWeeklyCapacity = teamSize * 35;
  const estimatedWeeks = productiveWeeklyCapacity > 0
    ? Math.ceil(estimatedHours / productiveWeeklyCapacity)
    : 0;

  return {
    workingDays,
    availableHours,
    productiveHours,
    rawDevelopmentHours,
    testingHours,
    integrationHours,
    documentationHours,
    reworkHours,
    estimatedHours,
    estimatedWeeks,
    capacityUtilization,
    bufferHours,
    bufferPercent,
    timelineFit,
  };
}

/**
 * Calculate all capacity metrics for scope analysis.
 */
export function calculateCapacityMetrics(input: CapacityMetricsInput): CapacityMetricsOutput {
  const { teamSize, workingHoursPerDay, workingDays, estimatedHours, complexityScore } = input;

  // Calculate available hours
  const availableHours = teamSize * workingHoursPerDay * workingDays;

  // Calculate efficiency
  const efficiency = calculateEfficiency(complexityScore);

  // Calculate effective available hours
  const effectiveAvailableHours = availableHours * efficiency;

  // Calculate estimated weeks
  const effectiveWeeklyCapacity = teamSize * workingHoursPerDay * 5 * efficiency;
  const estimatedWeeks = effectiveWeeklyCapacity > 0
    ? Math.ceil(estimatedHours / effectiveWeeklyCapacity)
    : 0;

  // Calculate capacity utilization
  const capacityUtilization = effectiveAvailableHours > 0
    ? (estimatedHours / effectiveAvailableHours) * 100
    : 0;

  // Determine deadline feasibility
  const deadlineFeasible = effectiveAvailableHours > 0 && estimatedHours <= effectiveAvailableHours;

  // Calculate capacity buffer
  const capacityBuffer = effectiveAvailableHours - estimatedHours;
  const rawBufferPercent = effectiveAvailableHours > 0
    ? ((effectiveAvailableHours - estimatedHours) / effectiveAvailableHours) * 100
    : 0;
  const capacityBufferPercent = Math.round(Math.max(-100, Math.min(100, rawBufferPercent)));

  return {
    availableHours,
    effectiveAvailableHours,
    estimatedWeeks,
    capacityUtilization,
    capacityBuffer,
    capacityBufferPercent,
    deadlineFeasible,
  };
}

/**
 * Derive risk level from capacity utilization, complexity, and deadline feasibility.
 */
export function deriveRiskLevel(input: RiskLevelInput): "Low" | "Medium" | "High" {
  const { capacityUtilization, complexityScore, deadlineFeasible } = input;

  let riskLevel: "Low" | "Medium" | "High";

  if (capacityUtilization > 100) {
    riskLevel = "High";
  } else if (capacityUtilization > 80) {
    riskLevel = "Medium";
  } else if (complexityScore >= 71) {
    riskLevel = "High";
  } else if (complexityScore >= 41) {
    riskLevel = "Medium";
  } else {
    riskLevel = "Low";
  }

  // Override to High if deadline is not feasible
  if (!deadlineFeasible) {
    riskLevel = "High";
  }

  return riskLevel;
}

/**
 * Derive project health from buffer percentage.
 */
export function deriveProjectHealth(input: ProjectHealthInput): "Healthy" | "Manageable" | "Tight" | "At Risk" {
  const { capacityBufferPercent } = input;

  if (capacityBufferPercent > 20) {
    return "Healthy";
  } else if (capacityBufferPercent >= 10) {
    return "Manageable";
  } else if (capacityBufferPercent >= 0) {
    return "Tight";
  } else {
    return "At Risk";
  }
}

/**
 * Derive confidence level from complexity and risk factor count.
 * Returns a numeric score (0-100) instead of a string level.
 */
export function deriveConfidence(input: ConfidenceInput): number {
  const { complexityScore, riskFactorCount } = input;

  if (complexityScore < 40 && riskFactorCount <= 2) {
    return 85; // High confidence
  } else if (complexityScore < 60 && riskFactorCount <= 3) {
    return 60; // Medium confidence
  } else {
    return 35; // Low confidence
  }
}

/**
 * Calculate complexity score from feature estimates.
 * Maps complexity levels to numeric scores and averages them.
 */
export function calculateComplexityScoreFromFeatures(featureEstimates: FeatureEstimate[]): number {
  if (featureEstimates.length === 0) return 50;

  const complexityMap: Record<string, number> = {
    "Simple": 20,
    "Medium": 50,
    "Complex": 75,
    "Very Complex": 90,
  };

  const totalScore = featureEstimates.reduce((sum, estimate) => {
    const score = complexityMap[estimate.complexity] || 50;
    return sum + score;
  }, 0);

  return Math.round(totalScore / featureEstimates.length);
}

/**
 * Generate effort breakdown from total estimated hours.
 * Uses standard allocation percentages: 60% dev, 17% test, 13% integration, 10% docs.
 */
export function generateEffortBreakdown(totalHours: number): {
  development: number;
  testing: number;
  integration: number;
  documentation: number;
} {
  const devHours = Math.round(totalHours * 0.6);
  const testHours = Math.round(totalHours * 0.17);
  const intHours = Math.round(totalHours * 0.13);
  const docHours = totalHours - devHours - testHours - intHours;

  return {
    development: devHours,
    testing: testHours,
    integration: intHours,
    documentation: docHours,
  };
}

/**
 * Calculate scope score from feature count and complexity.
 * Higher feature count and complexity increase scope score.
 */
export function calculateScopeScore(featureCount: number, complexityScore: number): number {
  const baseScore = 20;
  const featureScore = Math.min(40, featureCount * 5);
  const complexityBonus = Math.min(35, (complexityScore / 95) * 35);
  
  return Math.min(95, Math.round(baseScore + featureScore + complexityBonus));
}
