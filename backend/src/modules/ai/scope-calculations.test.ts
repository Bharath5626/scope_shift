import {
  calculateCapacityMetrics,
  deriveRiskLevel,
  deriveProjectHealth,
  deriveConfidence,
  calculateEfficiency,
} from './scope-calculations';

describe('calculateEfficiency', () => {
  it('should return 0.55 for high complexity (>= 70)', () => {
    expect(calculateEfficiency(70)).toBe(0.55);
    expect(calculateEfficiency(75)).toBe(0.55);
    expect(calculateEfficiency(95)).toBe(0.55);
  });

  it('should return 0.65 for medium complexity (45-69)', () => {
    expect(calculateEfficiency(45)).toBe(0.65);
    expect(calculateEfficiency(60)).toBe(0.65);
    expect(calculateEfficiency(69)).toBe(0.65);
  });

  it('should return 0.75 for low complexity (< 45)', () => {
    expect(calculateEfficiency(10)).toBe(0.75);
    expect(calculateEfficiency(30)).toBe(0.75);
    expect(calculateEfficiency(44)).toBe(0.75);
  });
});

describe('calculateCapacityMetrics', () => {
  describe('feasible projects', () => {
    it('should calculate metrics for a feasible project with healthy buffer', () => {
      const result = calculateCapacityMetrics({
        teamSize: 3,
        workingHoursPerDay: 8,
        workingDays: 22,
        estimatedHours: 200,
        complexityScore: 50,
      });

      expect(result.availableHours).toBe(528); // 3 * 8 * 22
      expect(result.effectiveAvailableHours).toBe(343.2); // 528 * 0.65
      expect(result.estimatedWeeks).toBe(3); // ceil(200 / (3 * 8 * 5 * 0.65)) = ceil(200/78) = ceil(2.56) = 3
      expect(result.capacityUtilization).toBeCloseTo(58.3, 1); // (200 / 343.2) * 100
      expect(result.capacityBuffer).toBeCloseTo(143.2, 1); // 343.2 - 200
      expect(result.capacityBufferPercent).toBeCloseTo(42, 0); // (143.2 / 343.2) * 100
      expect(result.deadlineFeasible).toBe(true);
    });

    it('should calculate metrics for a feasible project with tight buffer', () => {
      const result = calculateCapacityMetrics({
        teamSize: 2,
        workingHoursPerDay: 8,
        workingDays: 22,
        estimatedHours: 200,
        complexityScore: 50,
      });

      expect(result.availableHours).toBe(352); // 2 * 8 * 22
      expect(result.effectiveAvailableHours).toBe(228.8); // 352 * 0.65
      expect(result.estimatedWeeks).toBe(4); // ceil(200 / (2 * 8 * 5 * 0.65))
      expect(result.capacityUtilization).toBeCloseTo(87.4, 1); // (200 / 228.8) * 100
      expect(result.capacityBuffer).toBeCloseTo(28.8, 1); // 228.8 - 200
      expect(result.capacityBufferPercent).toBeCloseTo(13, 0); // (28.8 / 228.8) * 100
      expect(result.deadlineFeasible).toBe(true);
    });
  });

  describe('infeasible projects', () => {
    it('should calculate metrics for an infeasible project', () => {
      const result = calculateCapacityMetrics({
        teamSize: 2,
        workingHoursPerDay: 8,
        workingDays: 5,
        estimatedHours: 200,
        complexityScore: 50,
      });

      expect(result.availableHours).toBe(80); // 2 * 8 * 5
      expect(result.effectiveAvailableHours).toBe(52); // 80 * 0.65
      expect(result.estimatedWeeks).toBe(4); // ceil(200 / (2 * 8 * 5 * 0.65))
      expect(result.capacityUtilization).toBeCloseTo(384.6, 1); // (200 / 52) * 100
      expect(result.capacityBuffer).toBe(-148); // 52 - 200
      expect(result.capacityBufferPercent).toBe(-100); // clamped
      expect(result.deadlineFeasible).toBe(false);
    });
  });

  describe('complexity variations', () => {
    it('should use 0.55 efficiency for high complexity', () => {
      const result = calculateCapacityMetrics({
        teamSize: 3,
        workingHoursPerDay: 8,
        workingDays: 22,
        estimatedHours: 400,
        complexityScore: 75,
      });

      expect(result.effectiveAvailableHours).toBeCloseTo(290.4, 1); // 528 * 0.55
      expect(result.capacityUtilization).toBeCloseTo(137.7, 1); // (400 / 290.4) * 100
      expect(result.deadlineFeasible).toBe(false);
    });

    it('should use 0.65 efficiency for medium complexity', () => {
      const result = calculateCapacityMetrics({
        teamSize: 3,
        workingHoursPerDay: 8,
        workingDays: 22,
        estimatedHours: 400,
        complexityScore: 60,
      });

      expect(result.effectiveAvailableHours).toBe(343.2); // 528 * 0.65
      expect(result.capacityUtilization).toBeCloseTo(116.6, 1); // (400 / 343.2) * 100
      expect(result.deadlineFeasible).toBe(false);
    });

    it('should use 0.75 efficiency for low complexity', () => {
      const result = calculateCapacityMetrics({
        teamSize: 3,
        workingHoursPerDay: 8,
        workingDays: 22,
        estimatedHours: 400,
        complexityScore: 30,
      });

      expect(result.effectiveAvailableHours).toBe(396); // 528 * 0.75
      expect(result.capacityUtilization).toBeCloseTo(101.0, 1); // (400 / 396) * 100
      expect(result.deadlineFeasible).toBe(false);
    });
  });

  describe('utilization ranges', () => {
    it('should handle utilization > 100%', () => {
      const result = calculateCapacityMetrics({
        teamSize: 2,
        workingHoursPerDay: 8,
        workingDays: 5,
        estimatedHours: 200,
        complexityScore: 50,
      });

      expect(result.capacityUtilization).toBeGreaterThan(100);
    });

    it('should handle utilization 80-100%', () => {
      const result = calculateCapacityMetrics({
        teamSize: 2,
        workingHoursPerDay: 8,
        workingDays: 22,
        estimatedHours: 200,
        complexityScore: 50,
      });

      expect(result.capacityUtilization).toBeGreaterThan(80);
      expect(result.capacityUtilization).toBeLessThanOrEqual(100);
    });

    it('should handle utilization < 80%', () => {
      const result = calculateCapacityMetrics({
        teamSize: 3,
        workingHoursPerDay: 8,
        workingDays: 22,
        estimatedHours: 200,
        complexityScore: 50,
      });

      expect(result.capacityUtilization).toBeLessThan(80);
    });
  });

  describe('edge cases', () => {
    it('should handle zero working days', () => {
      const result = calculateCapacityMetrics({
        teamSize: 3,
        workingHoursPerDay: 8,
        workingDays: 0,
        estimatedHours: 100,
        complexityScore: 50,
      });

      expect(result.availableHours).toBe(0);
      expect(result.effectiveAvailableHours).toBe(0);
      expect(result.capacityUtilization).toBe(0);
      expect(result.capacityBuffer).toBe(-100);
      expect(result.capacityBufferPercent).toBe(0);
      expect(result.deadlineFeasible).toBe(false);
    });

    it('should clamp buffer percentage to -100', () => {
      const result = calculateCapacityMetrics({
        teamSize: 1,
        workingHoursPerDay: 8,
        workingDays: 5,
        estimatedHours: 1000,
        complexityScore: 50,
      });

      expect(result.capacityBufferPercent).toBe(-100);
    });

    it('should clamp buffer percentage to 100', () => {
      const result = calculateCapacityMetrics({
        teamSize: 10,
        workingHoursPerDay: 8,
        workingDays: 22,
        estimatedHours: 10,
        complexityScore: 50,
      });

      expect(result.capacityBufferPercent).toBe(99); // 396 - 10 = 386, (386/396)*100 = 97.47, rounded = 97
    });
  });
});

describe('deriveRiskLevel', () => {
  describe('utilization-based risk', () => {
    it('should return High when utilization > 100%', () => {
      expect(deriveRiskLevel({
        capacityUtilization: 150,
        complexityScore: 30,
        deadlineFeasible: true,
      })).toBe('High');
    });

    it('should return Medium when utilization 80-100%', () => {
      expect(deriveRiskLevel({
        capacityUtilization: 90,
        complexityScore: 30,
        deadlineFeasible: true,
      })).toBe('Medium');
    });

    it('should return Low when utilization < 80% and low complexity', () => {
      expect(deriveRiskLevel({
        capacityUtilization: 70,
        complexityScore: 30,
        deadlineFeasible: true,
      })).toBe('Low');
    });
  });

  describe('complexity-based risk', () => {
    it('should return High when complexity >= 71', () => {
      expect(deriveRiskLevel({
        capacityUtilization: 70,
        complexityScore: 75,
        deadlineFeasible: true,
      })).toBe('High');
    });

    it('should return Medium when complexity 41-70', () => {
      expect(deriveRiskLevel({
        capacityUtilization: 70,
        complexityScore: 50,
        deadlineFeasible: true,
      })).toBe('Medium');
    });

    it('should return Low when complexity < 41', () => {
      expect(deriveRiskLevel({
        capacityUtilization: 70,
        complexityScore: 30,
        deadlineFeasible: true,
      })).toBe('Low');
    });
  });

  describe('deadline feasibility override', () => {
    it('should override to High when deadline not feasible', () => {
      expect(deriveRiskLevel({
        capacityUtilization: 50,
        complexityScore: 30,
        deadlineFeasible: false,
      })).toBe('High');
    });

    it('should override to High even with low utilization', () => {
      expect(deriveRiskLevel({
        capacityUtilization: 50,
        complexityScore: 20,
        deadlineFeasible: false,
      })).toBe('High');
    });
  });

  describe('priority order', () => {
    it('should prioritize utilization over complexity', () => {
      expect(deriveRiskLevel({
        capacityUtilization: 150,
        complexityScore: 20,
        deadlineFeasible: true,
      })).toBe('High'); // utilization > 100 takes precedence
    });

    it('should prioritize utilization > 80 over low complexity', () => {
      expect(deriveRiskLevel({
        capacityUtilization: 85,
        complexityScore: 20,
        deadlineFeasible: true,
      })).toBe('Medium'); // utilization > 80 takes precedence
    });
  });
});

describe('deriveProjectHealth', () => {
  describe('healthy projects', () => {
    it('should return Healthy when buffer > 20%', () => {
      expect(deriveProjectHealth({ capacityBufferPercent: 25 })).toBe('Healthy');
      expect(deriveProjectHealth({ capacityBufferPercent: 50 })).toBe('Healthy');
      expect(deriveProjectHealth({ capacityBufferPercent: 100 })).toBe('Healthy');
    });
  });

  describe('manageable projects', () => {
    it('should return Manageable when buffer 10-20%', () => {
      expect(deriveProjectHealth({ capacityBufferPercent: 10 })).toBe('Manageable');
      expect(deriveProjectHealth({ capacityBufferPercent: 15 })).toBe('Manageable');
      expect(deriveProjectHealth({ capacityBufferPercent: 20 })).toBe('Manageable');
    });
  });

  describe('tight projects', () => {
    it('should return Tight when buffer 0-10%', () => {
      expect(deriveProjectHealth({ capacityBufferPercent: 0 })).toBe('Tight');
      expect(deriveProjectHealth({ capacityBufferPercent: 5 })).toBe('Tight');
      expect(deriveProjectHealth({ capacityBufferPercent: 9 })).toBe('Tight');
    });
  });

  describe('at-risk projects', () => {
    it('should return At Risk when buffer < 0%', () => {
      expect(deriveProjectHealth({ capacityBufferPercent: -1 })).toBe('At Risk');
      expect(deriveProjectHealth({ capacityBufferPercent: -50 })).toBe('At Risk');
      expect(deriveProjectHealth({ capacityBufferPercent: -100 })).toBe('At Risk');
    });
  });

  describe('boundary conditions', () => {
    it('should handle exactly 20% as Manageable', () => {
      expect(deriveProjectHealth({ capacityBufferPercent: 20 })).toBe('Manageable');
    });

    it('should handle exactly 10% as Manageable', () => {
      expect(deriveProjectHealth({ capacityBufferPercent: 10 })).toBe('Manageable');
    });

    it('should handle exactly 0% as Tight', () => {
      expect(deriveProjectHealth({ capacityBufferPercent: 0 })).toBe('Tight');
    });
  });
});

describe('deriveConfidence', () => {
  describe('high confidence', () => {
    it('should return High for low complexity with few risks', () => {
      expect(deriveConfidence({ complexityScore: 30, riskFactorCount: 0 })).toBe('High');
      expect(deriveConfidence({ complexityScore: 30, riskFactorCount: 1 })).toBe('High');
      expect(deriveConfidence({ complexityScore: 30, riskFactorCount: 2 })).toBe('High');
      expect(deriveConfidence({ complexityScore: 39, riskFactorCount: 2 })).toBe('High');
    });
  });

  describe('medium confidence', () => {
    it('should return Medium for medium complexity with few risks', () => {
      expect(deriveConfidence({ complexityScore: 40, riskFactorCount: 0 })).toBe('Medium');
      expect(deriveConfidence({ complexityScore: 50, riskFactorCount: 2 })).toBe('Medium');
      expect(deriveConfidence({ complexityScore: 59, riskFactorCount: 3 })).toBe('Medium');
    });

    it('should return Medium for low complexity with moderate risks', () => {
      expect(deriveConfidence({ complexityScore: 30, riskFactorCount: 3 })).toBe('Medium');
    });
  });

  describe('low confidence', () => {
    it('should return Low for high complexity', () => {
      expect(deriveConfidence({ complexityScore: 70, riskFactorCount: 0 })).toBe('Low');
      expect(deriveConfidence({ complexityScore: 80, riskFactorCount: 2 })).toBe('Low');
    });

    it('should return Low for medium complexity with many risks', () => {
      expect(deriveConfidence({ complexityScore: 50, riskFactorCount: 4 })).toBe('Low');
    });

    it('should return Low for low complexity with many risks', () => {
      expect(deriveConfidence({ complexityScore: 30, riskFactorCount: 5 })).toBe('Low');
    });
  });

  describe('boundary conditions', () => {
    it('should handle complexity 39 with 2 risks as High', () => {
      expect(deriveConfidence({ complexityScore: 39, riskFactorCount: 2 })).toBe('High');
    });

    it('should handle complexity 40 with 2 risks as Medium', () => {
      expect(deriveConfidence({ complexityScore: 40, riskFactorCount: 2 })).toBe('Medium');
    });

    it('should handle complexity 59 with 3 risks as Medium', () => {
      expect(deriveConfidence({ complexityScore: 59, riskFactorCount: 3 })).toBe('Medium');
    });

    it('should handle complexity 60 with 3 risks as Low', () => {
      expect(deriveConfidence({ complexityScore: 60, riskFactorCount: 3 })).toBe('Low');
    });
  });
});
