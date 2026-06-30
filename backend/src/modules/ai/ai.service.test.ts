import { calculateWorkingDays } from './ai.service';

describe('calculateWorkingDays', () => {
  describe('weekday ranges', () => {
    it('should calculate working days for a Monday to Friday range', () => {
      const start = new Date('2024-01-01'); // Monday
      const end = new Date('2024-01-05'); // Friday
      const result = calculateWorkingDays(start, end);
      expect(result).toBe(5);
    });

    it('should calculate working days for a Monday to Wednesday range', () => {
      const start = new Date('2024-01-01'); // Monday
      const end = new Date('2024-01-03'); // Wednesday
      const result = calculateWorkingDays(start, end);
      expect(result).toBe(3);
    });

    it('should calculate working days for a multi-week range', () => {
      const start = new Date('2024-01-01'); // Monday
      const end = new Date('2024-01-12'); // Friday (2 weeks)
      const result = calculateWorkingDays(start, end);
      expect(result).toBe(10);
    });
  });

  describe('weekend ranges', () => {
    it('should exclude weekends from calculation', () => {
      const start = new Date('2024-01-06'); // Saturday
      const end = new Date('2024-01-12'); // Friday
      const result = calculateWorkingDays(start, end);
      expect(result).toBe(5); // Mon-Fri only
    });

    it('should handle range starting on Saturday', () => {
      const start = new Date('2024-01-06'); // Saturday
      const end = new Date('2024-01-10'); // Wednesday
      const result = calculateWorkingDays(start, end);
      expect(result).toBe(3); // Mon-Wed only
    });

    it('should handle range ending on Sunday', () => {
      const start = new Date('2024-01-08'); // Monday
      const end = new Date('2024-01-14'); // Sunday
      const result = calculateWorkingDays(start, end);
      expect(result).toBe(5); // Mon-Fri only
    });
  });

  describe('same-day weekday', () => {
    it('should return 1 for same-day Monday project', () => {
      const start = new Date('2024-01-01'); // Monday
      const end = new Date('2024-01-01'); // Monday
      const result = calculateWorkingDays(start, end);
      expect(result).toBe(1);
    });

    it('should return 1 for same-day Wednesday project', () => {
      const start = new Date('2024-01-03'); // Wednesday
      const end = new Date('2024-01-03'); // Wednesday
      const result = calculateWorkingDays(start, end);
      expect(result).toBe(1);
    });

    it('should return 1 for same-day Friday project', () => {
      const start = new Date('2024-01-05'); // Friday
      const end = new Date('2024-01-05'); // Friday
      const result = calculateWorkingDays(start, end);
      expect(result).toBe(1);
    });
  });

  describe('same-day weekend', () => {
    it('should throw error for same-day Saturday project', () => {
      const start = new Date('2024-01-06'); // Saturday
      const end = new Date('2024-01-06'); // Saturday
      expect(() => calculateWorkingDays(start, end)).toThrow(
        'Same-day project cannot be scheduled on a weekend'
      );
    });

    it('should throw error for same-day Sunday project', () => {
      const start = new Date('2024-01-07'); // Sunday
      const end = new Date('2024-01-07'); // Sunday
      expect(() => calculateWorkingDays(start, end)).toThrow(
        'Same-day project cannot be scheduled on a weekend'
      );
    });
  });

  describe('invalid dates', () => {
    it('should throw error when deadline is before start date', () => {
      const start = new Date('2024-01-15');
      const end = new Date('2024-01-01');
      expect(() => calculateWorkingDays(start, end)).toThrow(
        'Deadline must be on or after start date'
      );
    });

    it('should throw error when entire range is weekends', () => {
      const start = new Date('2024-01-06'); // Saturday
      const end = new Date('2024-01-07'); // Sunday
      expect(() => calculateWorkingDays(start, end)).toThrow(
        'Project range must include at least one working day'
      );
    });
  });

  describe('edge cases', () => {
    it('should handle leap year dates correctly', () => {
      const start = new Date('2024-02-26'); // Monday
      const end = new Date('2024-03-01'); // Friday
      const result = calculateWorkingDays(start, end);
      expect(result).toBe(5);
    });

    it('should handle month boundaries correctly', () => {
      const start = new Date('2024-01-29'); // Monday
      const end = new Date('2024-02-02'); // Friday
      const result = calculateWorkingDays(start, end);
      expect(result).toBe(5);
    });

    it('should handle year boundaries correctly', () => {
      const start = new Date('2023-12-29'); // Friday
      const end = new Date('2024-01-05'); // Friday
      const result = calculateWorkingDays(start, end);
      expect(result).toBe(6); // Fri, Mon-Fri
    });
  });
});
