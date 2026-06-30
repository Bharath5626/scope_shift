/**
 * Unit tests for the new capacity calculation engine.
 * This engine is deterministic and does not rely on AI for timeline calculations.
 */

import {
  calculateWorkingDays,
  calculateCapacityMetricsNew,
} from './scope-calculations';

describe('Capacity Calculation Engine', () => {
  describe('calculateWorkingDays', () => {
    it('should calculate working days for Monday to Friday', () => {
      const start = new Date('2024-01-08'); // Monday
      const end = new Date('2024-01-12'); // Friday
      const result = calculateWorkingDays(start, end);
      expect(result).toBe(5);
    });

    it('should calculate working days for Monday to next Monday', () => {
      const start = new Date('2024-01-08'); // Monday
      const end = new Date('2024-01-15'); // Next Monday
      const result = calculateWorkingDays(start, end);
      expect(result).toBe(6);
    });

    it('should exclude weekends', () => {
      const start = new Date('2024-01-06'); // Saturday
      const end = new Date('2024-01-12'); // Friday
      const result = calculateWorkingDays(start, end);
      expect(result).toBe(5); // Mon-Fri only
    });

    it('should include both start and end dates when they are weekdays', () => {
      const start = new Date('2024-01-08'); // Monday
      const end = new Date('2024-01-08'); // Same Monday
      const result = calculateWorkingDays(start, end);
      expect(result).toBe(1);
    });

    it('should throw error when start date is after end date', () => {
      const start = new Date('2024-01-15');
      const end = new Date('2024-01-08');
      expect(() => calculateWorkingDays(start, end)).toThrow('Start date must be before or equal to end date');
    });

    it('should throw error when range has no working days', () => {
      const start = new Date('2024-01-06'); // Saturday
      const end = new Date('2024-01-07'); // Sunday
      expect(() => calculateWorkingDays(start, end)).toThrow('Project range must include at least one working day');
    });

    it('should handle leap year dates', () => {
      const start = new Date('2024-02-28'); // Wednesday
      const end = new Date('2024-03-01'); // Friday
      const result = calculateWorkingDays(start, end);
      expect(result).toBe(3); // Wed, Thu, Fri
    });
  });

  describe('calculateCapacityMetricsNew', () => {
    const validInput = {
      teamSize: 3,
      workingHoursPerDay: 8,
      startDate: new Date('2024-01-08'),
      deadline: new Date('2024-02-02'),
      featureEstimates: [
        { feature: 'User Registration', complexity: 'Simple' as const, estimatedHours: 40 },
        { feature: 'Payment Processing', complexity: 'Complex' as const, estimatedHours: 30 },
        { feature: 'Admin Dashboard', complexity: 'Medium' as const, estimatedHours: 20 },
      ],
    };

    it('should calculate capacity metrics correctly', () => {
      const result = calculateCapacityMetricsNew(validInput);

      // Working days: 4 weeks = 20 days
      expect(result.workingDays).toBe(20);

      // Available hours: 20 * 8 * 3 = 480
      expect(result.availableHours).toBe(480);

      // Productive hours: 480 * 0.75 = 360
      expect(result.productiveHours).toBe(360);

      // Raw development: 40 + 30 + 20 = 90
      expect(result.rawDevelopmentHours).toBe(90);

      // Overheads: 90 * 0.20 = 18, 90 * 0.15 = 14, 90 * 0.05 = 5, 90 * 0.10 = 9
      expect(result.testingHours).toBe(18);
      expect(result.integrationHours).toBe(14);
      expect(result.documentationHours).toBe(5);
      expect(result.reworkHours).toBe(9);

      // Total estimated: 90 + 18 + 14 + 5 + 9 = 136
      expect(result.estimatedHours).toBe(136);

      // Capacity utilization: (136 / 360) * 100 = 38%
      expect(result.capacityUtilization).toBe(38);

      // Buffer hours: 360 - 136 = 224
      expect(result.bufferHours).toBe(224);

      // Buffer percent: (224 / 360) * 100 = 62%
      expect(result.bufferPercent).toBe(62);

      // Timeline fit: > 20% = ON_TRACK
      expect(result.timelineFit).toBe('ON_TRACK');

      // Estimated weeks: ceil(136 / (3 * 35)) = ceil(136 / 105) = 2
      expect(result.estimatedWeeks).toBe(2);
    });

    it('should return AT_RISK when buffer is between 0-20%', () => {
      const input = {
        ...validInput,
        featureEstimates: [
          { feature: 'Large Feature', complexity: 'Complex' as const, estimatedHours: 200 },
        ],
      };
      const result = calculateCapacityMetricsNew(input);
      expect(result.timelineFit).toBe('AT_RISK');
    });

    it('should return OVER_CAPACITY when buffer is negative', () => {
      const input = {
        ...validInput,
        featureEstimates: [
          { feature: 'Huge Feature', complexity: 'Very Complex' as const, estimatedHours: 500 },
        ],
      };
      const result = calculateCapacityMetricsNew(input);
      expect(result.timelineFit).toBe('OVER_CAPACITY');
    });

    it('should throw error for invalid team size', () => {
      const input = { ...validInput, teamSize: 0 };
      expect(() => calculateCapacityMetricsNew(input)).toThrow('Team size must be a positive number');
    });

    it('should throw error for negative team size', () => {
      const input = { ...validInput, teamSize: -1 };
      expect(() => calculateCapacityMetricsNew(input)).toThrow('Team size must be a positive number');
    });

    it('should throw error for invalid working hours', () => {
      const input = { ...validInput, workingHoursPerDay: 0 };
      expect(() => calculateCapacityMetricsNew(input)).toThrow('Working hours per day must be a positive number');
    });

    it('should throw error for invalid start date', () => {
      const input = { ...validInput, startDate: new Date('invalid') };
      expect(() => calculateCapacityMetricsNew(input)).toThrow('Invalid start date');
    });

    it('should throw error for invalid deadline', () => {
      const input = { ...validInput, deadline: new Date('invalid') };
      expect(() => calculateCapacityMetricsNew(input)).toThrow('Invalid deadline date');
    });

    it('should throw error when deadline is before start date', () => {
      const input = {
        ...validInput,
        startDate: new Date('2024-02-01'),
        deadline: new Date('2024-01-01'),
      };
      expect(() => calculateCapacityMetricsNew(input)).toThrow('Deadline cannot be before start date');
    });

    it('should throw error for empty feature estimates', () => {
      const input = { ...validInput, featureEstimates: [] };
      expect(() => calculateCapacityMetricsNew(input)).toThrow('Feature estimates must be a non-empty array');
    });

    it('should handle single feature estimate', () => {
      const input = {
        ...validInput,
        featureEstimates: [
          { feature: 'Single Feature', complexity: 'Medium' as const, estimatedHours: 50 },
        ],
      };
      const result = calculateCapacityMetricsNew(input);
      expect(result.rawDevelopmentHours).toBe(50);
      expect(result.estimatedHours).toBe(76); // 50 + 10 + 8 + 3 + 5 = 76 (with rounding)
    });

    it('should handle large team size', () => {
      const input = {
        ...validInput,
        teamSize: 10,
      };
      const result = calculateCapacityMetricsNew(input);
      expect(result.availableHours).toBe(1600); // 20 * 8 * 10
      expect(result.productiveHours).toBe(1200); // 1600 * 0.75
    });

    it('should handle different working hours', () => {
      const input = {
        ...validInput,
        workingHoursPerDay: 6,
      };
      const result = calculateCapacityMetricsNew(input);
      expect(result.availableHours).toBe(360); // 20 * 6 * 3
      expect(result.productiveHours).toBe(270); // 360 * 0.75
    });

    it('should handle zero estimated hours from features', () => {
      const input = {
        ...validInput,
        featureEstimates: [
          { feature: 'Empty Feature', complexity: 'Simple' as const, estimatedHours: 0 },
        ],
      };
      const result = calculateCapacityMetricsNew(input);
      expect(result.rawDevelopmentHours).toBe(0);
      expect(result.estimatedHours).toBe(0);
      expect(result.capacityUtilization).toBe(0);
      expect(result.timelineFit).toBe('ON_TRACK');
    });

    it('should calculate overhead percentages correctly', () => {
      const input = {
        ...validInput,
        featureEstimates: [
          { feature: 'Test Feature', complexity: 'Medium' as const, estimatedHours: 100 },
        ],
      };
      const result = calculateCapacityMetricsNew(input);
      
      // Raw: 100
      expect(result.rawDevelopmentHours).toBe(100);
      
      // Testing: 100 * 0.20 = 20
      expect(result.testingHours).toBe(20);
      
      // Integration: 100 * 0.15 = 15
      expect(result.integrationHours).toBe(15);
      
      // Documentation: 100 * 0.05 = 5
      expect(result.documentationHours).toBe(5);
      
      // Rework: 100 * 0.10 = 10
      expect(result.reworkHours).toBe(10);
      
      // Total: 100 + 20 + 15 + 5 + 10 = 150
      expect(result.estimatedHours).toBe(150);
    });

    it('should calculate estimated weeks based on team size', () => {
      const input = {
        ...validInput,
        featureEstimates: [
          { feature: 'Large Feature', complexity: 'Complex' as const, estimatedHours: 105 },
        ],
      };
      const result = calculateCapacityMetricsNew(input);
      
      // Estimated hours: 105 * 1.5 = 157.5 ≈ 158
      // With 3 developers: 3 * 35 = 105 productive hours/week
      // Weeks: ceil(158 / 105) = 2
      expect(result.estimatedWeeks).toBeGreaterThan(1);
    });
  });
});
