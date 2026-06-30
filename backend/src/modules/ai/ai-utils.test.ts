/**
 * Unit tests for AI hardening utilities.
 * Tests safe parsing, validation, error handling, retry logic, and logging.
 */

import {
  safeParseJson,
  validateFeatureEstimateResponse,
  withTimeout,
  withRetry,
  createTimeoutPromise,
  handleAIError,
  logAIError,
  logAISuccess,
  createAIFallbackResponse,
  AIValidationError,
  AITimeoutError,
  AIRateLimitError,
  AIResponseError,
  AINetworkError,
  AIUnavailableError,
  type FeatureEstimate,
} from './ai-utils';

describe('AI Hardening Utilities', () => {
  describe('safeParseJson', () => {
    it('should parse valid JSON', () => {
      const result = safeParseJson('{"key": "value"}');
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ key: 'value' });
    });

    it('should handle empty string', () => {
      const result = safeParseJson('');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Input is empty or not a string');
    });

    it('should handle null input', () => {
      const result = safeParseJson(null);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Input is empty or not a string');
    });

    it('should handle undefined input', () => {
      const result = safeParseJson(undefined);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Input is empty or not a string');
    });

    it('should handle non-string input', () => {
      const result = safeParseJson(123 as any);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Input is empty or not a string');
    });

    it('should handle malformed JSON', () => {
      const result = safeParseJson('{invalid json}');
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle markdown-wrapped JSON', () => {
      const result = safeParseJson('```json\n{"key": "value"}\n```');
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ key: 'value' });
    });

    it('should handle JSON without markdown wrapper', () => {
      const result = safeParseJson('{"key": "value"}');
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ key: 'value' });
    });

    it('should handle whitespace-only string', () => {
      const result = safeParseJson('   ');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Input is empty');
    });
  });

  describe('validateFeatureEstimateResponse', () => {
    const validResponse = {
      featureEstimates: [
        { feature: 'Test Feature', complexity: 'Medium' as const, estimatedHours: 40 },
      ],
      riskFactors: ['Risk 1'],
      recommendations: ['Recommendation 1'],
    };

    it('should validate a valid response', () => {
      const result = validateFeatureEstimateResponse(validResponse);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject missing response', () => {
      const result = validateFeatureEstimateResponse(null);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Response is missing or not an object');
    });

    it('should reject non-object response', () => {
      const result = validateFeatureEstimateResponse('string');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Response is missing or not an object');
    });

    it('should reject missing featureEstimates', () => {
      const result = validateFeatureEstimateResponse({});
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing required field: featureEstimates');
    });

    it('should reject non-array featureEstimates', () => {
      const result = validateFeatureEstimateResponse({ featureEstimates: 'not array' });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('featureEstimates must be an array');
    });

    it('should reject empty featureEstimates array', () => {
      const result = validateFeatureEstimateResponse({ featureEstimates: [] });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('featureEstimates array is empty');
    });

    it('should reject when feature count does not match expected', () => {
      const result = validateFeatureEstimateResponse(validResponse, 2);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Expected 2 feature estimates, got 1');
    });

    it('should accept when feature count matches expected', () => {
      const result = validateFeatureEstimateResponse(validResponse, 1);
      expect(result.valid).toBe(true);
    });

    it('should reject estimate missing feature field', () => {
      const response = {
        featureEstimates: [
          { complexity: 'Medium' as const, estimatedHours: 40 },
        ],
      };
      const result = validateFeatureEstimateResponse(response);
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('feature');
    });

    it('should reject estimate with non-string feature', () => {
      const response = {
        featureEstimates: [
          { feature: 123, complexity: 'Medium' as const, estimatedHours: 40 },
        ],
      };
      const result = validateFeatureEstimateResponse(response);
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('feature');
    });

    it('should reject estimate missing estimatedHours', () => {
      const response = {
        featureEstimates: [
          { feature: 'Test', complexity: 'Medium' as const },
        ],
      };
      const result = validateFeatureEstimateResponse(response);
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('estimatedHours');
    });

    it('should reject estimate with non-number estimatedHours', () => {
      const response = {
        featureEstimates: [
          { feature: 'Test', complexity: 'Medium' as const, estimatedHours: '40' as any },
        ],
      };
      const result = validateFeatureEstimateResponse(response);
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('estimatedHours');
    });

    it('should reject estimate with zero estimatedHours', () => {
      const response = {
        featureEstimates: [
          { feature: 'Test', complexity: 'Medium' as const, estimatedHours: 0 },
        ],
      };
      const result = validateFeatureEstimateResponse(response);
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('estimatedHours');
    });

    it('should reject estimate with negative estimatedHours', () => {
      const response = {
        featureEstimates: [
          { feature: 'Test', complexity: 'Medium' as const, estimatedHours: -10 },
        ],
      };
      const result = validateFeatureEstimateResponse(response);
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('estimatedHours');
    });

    it('should reject estimate missing complexity', () => {
      const response = {
        featureEstimates: [
          { feature: 'Test', estimatedHours: 40 },
        ],
      };
      const result = validateFeatureEstimateResponse(response);
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('complexity');
    });

    it('should reject estimate with invalid complexity', () => {
      const response = {
        featureEstimates: [
          { feature: 'Test', complexity: 'Invalid' as any, estimatedHours: 40 },
        ],
      };
      const result = validateFeatureEstimateResponse(response);
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('Invalid');
    });

    it('should reject non-array riskFactors', () => {
      const response = {
        featureEstimates: validResponse.featureEstimates,
        riskFactors: 'not array' as any,
      };
      const result = validateFeatureEstimateResponse(response);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('riskFactors must be an array if present');
    });

    it('should reject non-array recommendations', () => {
      const response = {
        featureEstimates: validResponse.featureEstimates,
        recommendations: 'not array' as any,
      };
      const result = validateFeatureEstimateResponse(response);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('recommendations must be an array if present');
    });

    it('should accept valid complexity values', () => {
      const validComplexities = ['Simple', 'Medium', 'Complex', 'Very Complex'] as const;
      for (const complexity of validComplexities) {
        const response = {
          featureEstimates: [
            { feature: 'Test', complexity, estimatedHours: 40 },
          ],
        };
        const result = validateFeatureEstimateResponse(response);
        expect(result.valid).toBe(true);
      }
    });
  });

  describe('createTimeoutPromise', () => {
    it('should reject after timeout', async () => {
      const timeout = 100;
      const start = Date.now();
      
      await expect(createTimeoutPromise(timeout)).rejects.toThrow(AITimeoutError);
      
      const elapsed = Date.now() - start;
      expect(elapsed).toBeGreaterThanOrEqual(timeout - 10);
      expect(elapsed).toBeLessThan(timeout + 50);
    });
  });

  describe('withTimeout', () => {
    it('should resolve promise before timeout', async () => {
      const promise = Promise.resolve('success');
      const result = await withTimeout(promise, 1000);
      expect(result).toBe('success');
    });

    it('should timeout slow promise', async () => {
      const promise = new Promise(resolve => setTimeout(() => resolve('slow'), 200));
      await expect(withTimeout(promise, 50)).rejects.toThrow(AITimeoutError);
    });

    it('should reject with original error if promise fails', async () => {
      const promise = Promise.reject(new Error('original error'));
      await expect(withTimeout(promise, 1000)).rejects.toThrow('original error');
    });
  });

  describe('withRetry', () => {
    it('should succeed on first attempt', async () => {
      let attempts = 0;
      const fn = () => {
        attempts++;
        return Promise.resolve('success');
      };
      
      const result = await withRetry(fn);
      expect(result).toBe('success');
      expect(attempts).toBe(1);
    });

    it('should retry on retryable error', async () => {
      let attempts = 0;
      const fn = () => {
        attempts++;
        if (attempts < 2) {
          return Promise.reject(new Error('timeout'));
        }
        return Promise.resolve('success');
      };
      
      const result = await withRetry(fn);
      expect(result).toBe('success');
      expect(attempts).toBe(2);
    });

    it('should not retry on non-retryable error', async () => {
      let attempts = 0;
      const fn = () => {
        attempts++;
        return Promise.reject(new Error('validation failed'));
      };
      
      await expect(withRetry(fn)).rejects.toThrow('validation failed');
      expect(attempts).toBe(1);
    });

    it('should fail after max retries', async () => {
      let attempts = 0;
      const fn = () => {
        attempts++;
        return Promise.reject(new Error('timeout'));
      };
      
      await expect(withRetry(fn, { maxRetries: 2, retryableErrors: ['timeout'], delays: [10] }))
        .rejects.toThrow('timeout');
      expect(attempts).toBe(3); // initial + 2 retries
    });

    it('should respect custom delays', async () => {
      let attempts = 0;
      const timestamps: number[] = [];
      
      const fn = () => {
        timestamps.push(Date.now());
        attempts++;
        if (attempts < 3) {
          return Promise.reject(new Error('timeout'));
        }
        return Promise.resolve('success');
      };
      
      await withRetry(fn, { maxRetries: 3, retryableErrors: ['timeout'], delays: [50, 100] });
      
      expect(timestamps).toHaveLength(3);
      expect(timestamps[1] - timestamps[0]).toBeGreaterThanOrEqual(50);
      expect(timestamps[2] - timestamps[1]).toBeGreaterThanOrEqual(100);
    });

    it('should retry on 429 error', async () => {
      let attempts = 0;
      const fn = () => {
        attempts++;
        if (attempts < 2) {
          return Promise.reject(new Error('429 Too Many Requests'));
        }
        return Promise.resolve('success');
      };
      
      const result = await withRetry(fn);
      expect(result).toBe('success');
      expect(attempts).toBe(2);
    });

    it('should retry on 500 error', async () => {
      let attempts = 0;
      const fn = () => {
        attempts++;
        if (attempts < 2) {
          return Promise.reject(new Error('500 Internal Server Error'));
        }
        return Promise.resolve('success');
      };
      
      const result = await withRetry(fn);
      expect(result).toBe('success');
      expect(attempts).toBe(2);
    });
  });

  describe('Custom Error Classes', () => {
    it('should create AIValidationError with message', () => {
      const error = new AIValidationError('Invalid data');
      expect(error.name).toBe('AIValidationError');
      expect(error.message).toBe('Invalid data');
      expect(error.validationErrors).toEqual([]);
    });

    it('should create AIValidationError with validation errors', () => {
      const errors = ['Error 1', 'Error 2'];
      const error = new AIValidationError('Invalid data', errors);
      expect(error.validationErrors).toEqual(errors);
    });

    it('should create AITimeoutError with default message', () => {
      const error = new AITimeoutError();
      expect(error.name).toBe('AITimeoutError');
      expect(error.message).toBe('AI request timed out');
    });

    it('should create AITimeoutError with custom message', () => {
      const error = new AITimeoutError('Custom timeout');
      expect(error.message).toBe('Custom timeout');
    });

    it('should create AIRateLimitError with default message', () => {
      const error = new AIRateLimitError();
      expect(error.name).toBe('AIRateLimitError');
      expect(error.message).toBe('AI service rate limit exceeded');
    });

    it('should create AIRateLimitError with custom message', () => {
      const error = new AIRateLimitError('Custom rate limit');
      expect(error.message).toBe('Custom rate limit');
    });

    it('should create AIResponseError with message', () => {
      const error = new AIResponseError('Response error');
      expect(error.name).toBe('AIResponseError');
      expect(error.message).toBe('Response error');
      expect(error.originalError).toBeUndefined();
    });

    it('should create AIResponseError with original error', () => {
      const original = new Error('Original error');
      const error = new AIResponseError('Response error', original);
      expect(error.originalError).toBe(original);
    });

    it('should create AINetworkError with default message', () => {
      const error = new AINetworkError();
      expect(error.name).toBe('AINetworkError');
      expect(error.message).toBe('AI service network error');
    });

    it('should create AINetworkError with custom message', () => {
      const error = new AINetworkError('Custom network error');
      expect(error.message).toBe('Custom network error');
    });

    it('should create AIUnavailableError with default message', () => {
      const error = new AIUnavailableError();
      expect(error.name).toBe('AIUnavailableError');
      expect(error.message).toBe('AI service unavailable');
    });

    it('should create AIUnavailableError with custom message', () => {
      const error = new AIUnavailableError('Custom unavailable');
      expect(error.message).toBe('Custom unavailable');
    });
  });

  describe('handleAIError', () => {
    it('should return user-safe message for AITimeoutError', () => {
      const error = new AITimeoutError();
      const message = handleAIError(error);
      expect(message).toBe('AI service took too long to respond. Please try again.');
    });

    it('should return user-safe message for AIRateLimitError', () => {
      const error = new AIRateLimitError();
      const message = handleAIError(error);
      expect(message).toBe('AI service is temporarily busy. Please try again in a few minutes.');
    });

    it('should return user-safe message for AIValidationError', () => {
      const error = new AIValidationError('Invalid data');
      const message = handleAIError(error);
      expect(message).toBe('AI returned invalid data. Please try again.');
    });

    it('should return user-safe message for AIResponseError', () => {
      const error = new AIResponseError('Response error');
      const message = handleAIError(error);
      expect(message).toBe('AI service encountered an error. Please try again.');
    });

    it('should return user-safe message for AINetworkError', () => {
      const error = new AINetworkError();
      const message = handleAIError(error);
      expect(message).toBe('Network error connecting to AI service. Please check your connection.');
    });

    it('should return user-safe message for AIUnavailableError', () => {
      const error = new AIUnavailableError();
      const message = handleAIError(error);
      expect(message).toBe('AI service is currently unavailable. Please try again later.');
    });

    it('should handle timeout in generic Error', () => {
      const error = new Error('Request timed out');
      const message = handleAIError(error);
      expect(message).toBe('AI service took too long to respond. Please try again.');
    });

    it('should handle 429 in generic Error', () => {
      const error = new Error('429 Too Many Requests');
      const message = handleAIError(error);
      expect(message).toBe('AI service is temporarily busy. Please try again in a few minutes.');
    });

    it('should handle rate limit in generic Error', () => {
      const error = new Error('Rate limit exceeded');
      const message = handleAIError(error);
      expect(message).toBe('AI service is temporarily busy. Please try again in a few minutes.');
    });

    it('should handle 500 in generic Error', () => {
      const error = new Error('500 Internal Server Error');
      const message = handleAIError(error);
      expect(message).toBe('AI service is temporarily unavailable. Please try again.');
    });

    it('should handle 503 in generic Error', () => {
      const error = new Error('503 Service Unavailable');
      const message = handleAIError(error);
      expect(message).toBe('AI service is temporarily unavailable. Please try again.');
    });

    it('should handle network error in generic Error', () => {
      const error = new Error('ECONNREFUSED');
      const message = handleAIError(error);
      expect(message).toBe('Network error connecting to AI service. Please check your connection.');
    });

    it('should handle ENOTFOUND in generic Error', () => {
      const error = new Error('ENOTFOUND');
      const message = handleAIError(error);
      expect(message).toBe('Network error connecting to AI service. Please check your connection.');
    });

    it('should return generic message for unknown errors', () => {
      const error = new Error('Unknown error');
      const message = handleAIError(error);
      expect(message).toBe('AI service unavailable. Please try again later.');
    });

    it('should handle non-Error objects', () => {
      const message = handleAIError('string error');
      expect(message).toBe('AI service unavailable. Please try again later.');
    });
  });

  describe('Logging Functions', () => {
    let originalEnv: string | undefined;

    beforeEach(() => {
      originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
    });

    afterEach(() => {
      process.env.NODE_ENV = originalEnv;
    });

    it('should log AI error in development', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      logAIError({
        operation: 'test',
        errorType: 'TestError',
        errorMessage: 'Test error message',
        timestamp: '2024-01-01T00:00:00.000Z',
      });
      
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should log AI success in development', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      logAISuccess({
        operation: 'test',
        timestamp: '2024-01-01T00:00:00.000Z',
      });
      
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should not log in production', () => {
      process.env.NODE_ENV = 'production';
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      logAIError({
        operation: 'test',
        errorType: 'TestError',
        errorMessage: 'Test error message',
        timestamp: '2024-01-01T00:00:00.000Z',
      });
      
      // In production, logging would go to a proper service
      // For now, we just verify it doesn't crash
      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('createAIFallbackResponse', () => {
    it('should create fallback response with message', () => {
      const response = createAIFallbackResponse('AI service unavailable');
      expect(response.success).toBe(false);
      expect(response.reason).toBe('AI_UNAVAILABLE');
      expect(response.message).toBe('AI service unavailable');
    });

    it('should have correct structure', () => {
      const response = createAIFallbackResponse('Test message');
      expect(response).toEqual({
        success: false,
        reason: 'AI_UNAVAILABLE',
        message: 'Test message',
      });
    });
  });
});
