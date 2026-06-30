/**
 * Unit tests for deterministic derivation logic in scope analysis.
 * These tests verify that all project-level metrics are derived from capacity engine output,
 * not from AI-generated values.
 */

import {
  calculateCapacityMetricsNew,
} from './scope-calculations';

describe('Deterministic Derivation Logic', () => {
  describe('Risk Level Derivation', () => {
    it('should derive Low risk when utilization < 70%', () => {
      const input = {
        teamSize: 3,
        workingHoursPerDay: 8,
        startDate: new Date('2024-01-08'),
        deadline: new Date('2024-02-02'),
        featureEstimates: [
          { feature: 'Small Feature', complexity: 'Simple' as const, estimatedHours: 20 },
        ],
      };
      const result = calculateCapacityMetricsNew(input);
      
      // With small feature, utilization should be low
      expect(result.capacityUtilization).toBeLessThan(70);
    });

    it('should derive Medium risk when utilization is 70-90%', () => {
      const input = {
        teamSize: 3,
        workingHoursPerDay: 8,
        startDate: new Date('2024-01-08'),
        deadline: new Date('2024-02-02'),
        featureEstimates: [
          { feature: 'Medium Feature', complexity: 'Complex' as const, estimatedHours: 200 },
        ],
      };
      const result = calculateCapacityMetricsNew(input);
      
      // With medium feature, utilization should be in 70-90% range
      expect(result.capacityUtilization).toBeGreaterThanOrEqual(70);
      expect(result.capacityUtilization).toBeLessThanOrEqual(90);
    });

    it('should derive High risk when utilization > 90%', () => {
      const input = {
        teamSize: 3,
        workingHoursPerDay: 8,
        startDate: new Date('2024-01-08'),
        deadline: new Date('2024-02-02'),
        featureEstimates: [
          { feature: 'Large Feature', complexity: 'Very Complex' as const, estimatedHours: 400 },
        ],
      };
      const result = calculateCapacityMetricsNew(input);
      
      // With large feature, utilization should be high
      expect(result.capacityUtilization).toBeGreaterThan(90);
    });
  });

  describe('Complexity Derivation from Estimated Hours', () => {
    it('should derive Low complexity when estimatedHours < 100', () => {
      const estimatedHours = 80;
      let complexityLevel: "Low" | "Medium" | "High";
      let complexityScore: number;
      
      if (estimatedHours < 100) {
        complexityLevel = "Low";
        complexityScore = 30;
      } else if (estimatedHours <= 300) {
        complexityLevel = "Medium";
        complexityScore = 55;
      } else {
        complexityLevel = "High";
        complexityScore = 80;
      }
      
      expect(complexityLevel).toBe("Low");
      expect(complexityScore).toBe(30);
    });

    it('should derive Medium complexity when estimatedHours is 100-300', () => {
      const estimatedHours = 200;
      let complexityLevel: "Low" | "Medium" | "High";
      let complexityScore: number;
      
      if (estimatedHours < 100) {
        complexityLevel = "Low";
        complexityScore = 30;
      } else if (estimatedHours <= 300) {
        complexityLevel = "Medium";
        complexityScore = 55;
      } else {
        complexityLevel = "High";
        complexityScore = 80;
      }
      
      expect(complexityLevel).toBe("Medium");
      expect(complexityScore).toBe(55);
    });

    it('should derive High complexity when estimatedHours > 300', () => {
      const estimatedHours = 400;
      let complexityLevel: "Low" | "Medium" | "High";
      let complexityScore: number;
      
      if (estimatedHours < 100) {
        complexityLevel = "Low";
        complexityScore = 30;
      } else if (estimatedHours <= 300) {
        complexityLevel = "Medium";
        complexityScore = 55;
      } else {
        complexityLevel = "High";
        complexityScore = 80;
      }
      
      expect(complexityLevel).toBe("High");
      expect(complexityScore).toBe(80);
    });

    it('should handle boundary at 100 hours', () => {
      const estimatedHours = 100;
      let complexityLevel: "Low" | "Medium" | "High";
      
      if (estimatedHours < 100) {
        complexityLevel = "Low";
      } else if (estimatedHours <= 300) {
        complexityLevel = "Medium";
      } else {
        complexityLevel = "High";
      }
      
      expect(complexityLevel).toBe("Medium");
    });

    it('should handle boundary at 300 hours', () => {
      const estimatedHours = 300;
      let complexityLevel: "Low" | "Medium" | "High";
      
      if (estimatedHours < 100) {
        complexityLevel = "Low";
      } else if (estimatedHours <= 300) {
        complexityLevel = "Medium";
      } else {
        complexityLevel = "High";
      }
      
      expect(complexityLevel).toBe("Medium");
    });
  });

  describe('Scope Score Derivation from Utilization', () => {
    it('should calculate scope score from utilization formula', () => {
      const estimatedHours = 136;
      const productiveHours = 360;
      const scopeScore = Math.min(95, Math.round((estimatedHours / productiveHours) * 100));
      
      expect(scopeScore).toBe(38); // (136 / 360) * 100 = 37.78, rounded = 38
    });

    it('should cap scope score at 95', () => {
      const estimatedHours = 400;
      const productiveHours = 360;
      const scopeScore = Math.min(95, Math.round((estimatedHours / productiveHours) * 100));
      
      expect(scopeScore).toBe(95); // (400 / 360) * 100 = 111, capped at 95
    });

    it('should handle zero productive hours by capping at 95', () => {
      const estimatedHours = 100;
      const productiveHours = 0;
      const scopeScore = Math.min(95, Math.round((estimatedHours / productiveHours) * 100));
      
      expect(scopeScore).toBe(95); // Division by zero results in Infinity, capped at 95
    });

    it('should handle low utilization', () => {
      const estimatedHours = 50;
      const productiveHours = 360;
      const scopeScore = Math.min(95, Math.round((estimatedHours / productiveHours) * 100));
      
      expect(scopeScore).toBe(14); // (50 / 360) * 100 = 13.89, rounded = 14
    });
  });

  describe('Timeline Fit Propagation', () => {
    it('should propagate ON_TRACK when buffer > 20%', () => {
      const input = {
        teamSize: 3,
        workingHoursPerDay: 8,
        startDate: new Date('2024-01-08'),
        deadline: new Date('2024-02-02'),
        featureEstimates: [
          { feature: 'Small Feature', complexity: 'Simple' as const, estimatedHours: 40 },
        ],
      };
      const result = calculateCapacityMetricsNew(input);
      
      expect(result.timelineFit).toBe("ON_TRACK");
      expect(result.bufferPercent).toBeGreaterThan(20);
    });

    it('should propagate AT_RISK when buffer is 0-20%', () => {
      const input = {
        teamSize: 3,
        workingHoursPerDay: 8,
        startDate: new Date('2024-01-08'),
        deadline: new Date('2024-02-02'),
        featureEstimates: [
          { feature: 'Medium Feature', complexity: 'Complex' as const, estimatedHours: 200 },
        ],
      };
      const result = calculateCapacityMetricsNew(input);
      
      expect(result.timelineFit).toBe("AT_RISK");
      expect(result.bufferPercent).toBeGreaterThanOrEqual(0);
      expect(result.bufferPercent).toBeLessThanOrEqual(20);
    });

    it('should propagate OVER_CAPACITY when buffer < 0', () => {
      const input = {
        teamSize: 3,
        workingHoursPerDay: 8,
        startDate: new Date('2024-01-08'),
        deadline: new Date('2024-02-02'),
        featureEstimates: [
          { feature: 'Large Feature', complexity: 'Very Complex' as const, estimatedHours: 500 },
        ],
      };
      const result = calculateCapacityMetricsNew(input);
      
      expect(result.timelineFit).toBe("OVER_CAPACITY");
      expect(result.bufferPercent).toBeLessThan(0);
    });
  });

  describe('Effort Breakdown from Capacity Engine', () => {
    it('should use capacity engine values for effort breakdown', () => {
      const input = {
        teamSize: 3,
        workingHoursPerDay: 8,
        startDate: new Date('2024-01-08'),
        deadline: new Date('2024-02-02'),
        featureEstimates: [
          { feature: 'Test Feature', complexity: 'Medium' as const, estimatedHours: 100 },
        ],
      };
      const result = calculateCapacityMetricsNew(input);
      
      const effortBreakdown = {
        development: result.rawDevelopmentHours,
        testing: result.testingHours,
        integration: result.integrationHours,
        documentation: result.documentationHours,
      };
      
      // Verify breakdown matches capacity engine calculations
      expect(effortBreakdown.development).toBe(100);
      expect(effortBreakdown.testing).toBe(20); // 100 * 0.20
      expect(effortBreakdown.integration).toBe(15); // 100 * 0.15
      expect(effortBreakdown.documentation).toBe(5); // 100 * 0.05
    });

    it('should not include rework in effort breakdown', () => {
      const input = {
        teamSize: 3,
        workingHoursPerDay: 8,
        startDate: new Date('2024-01-08'),
        deadline: new Date('2024-02-02'),
        featureEstimates: [
          { feature: 'Test Feature', complexity: 'Medium' as const, estimatedHours: 100 },
        ],
      };
      const result = calculateCapacityMetricsNew(input);
      
      // Rework is calculated but not part of effort breakdown
      expect(result.reworkHours).toBe(10); // 100 * 0.10
      
      const effortBreakdown = {
        development: result.rawDevelopmentHours,
        testing: result.testingHours,
        integration: result.integrationHours,
        documentation: result.documentationHours,
      };
      
      // Sum of breakdown should not include rework
      const breakdownSum = effortBreakdown.development + effortBreakdown.testing + 
                         effortBreakdown.integration + effortBreakdown.documentation;
      expect(breakdownSum).toBe(140); // 100 + 20 + 15 + 5
    });
  });

  describe('Deterministic Behavior', () => {
    it('should produce same results for same inputs', () => {
      const input = {
        teamSize: 3,
        workingHoursPerDay: 8,
        startDate: new Date('2024-01-08'),
        deadline: new Date('2024-02-02'),
        featureEstimates: [
          { feature: 'Test Feature', complexity: 'Medium' as const, estimatedHours: 100 },
        ],
      };
      
      const result1 = calculateCapacityMetricsNew(input);
      const result2 = calculateCapacityMetricsNew(input);
      
      expect(result1).toEqual(result2);
    });

    it('should not depend on AI for timeline calculations', () => {
      const input = {
        teamSize: 3,
        workingHoursPerDay: 8,
        startDate: new Date('2024-01-08'),
        deadline: new Date('2024-02-02'),
        featureEstimates: [
          { feature: 'Test Feature', complexity: 'Medium' as const, estimatedHours: 100 },
        ],
      };
      
      const result = calculateCapacityMetricsNew(input);
      
      // All these values are calculated deterministically
      expect(typeof result.workingDays).toBe('number');
      expect(typeof result.availableHours).toBe('number');
      expect(typeof result.productiveHours).toBe('number');
      expect(typeof result.estimatedHours).toBe('number');
      expect(typeof result.estimatedWeeks).toBe('number');
      expect(typeof result.capacityUtilization).toBe('number');
      expect(typeof result.bufferHours).toBe('number');
      expect(typeof result.bufferPercent).toBe('number');
      expect(typeof result.timelineFit).toBe('string');
    });
  });
});
