/**
 * AI utilities for hardening Gemini integration.
 * Provides safe parsing, validation, error handling, and retry logic.
 */

export interface FeatureEstimate {
  feature: string;
  complexity: "Simple" | "Medium" | "Complex" | "Very Complex";
  estimatedHours: number;
}

export interface GeminiScopeResponse {
  featureEstimates: FeatureEstimate[];
  riskFactors?: string[];
  recommendations?: string[];
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export interface SafeParseResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

// Custom error classes for AI operations
export class AIValidationError extends Error {
  constructor(message: string, public validationErrors: string[] = []) {
    super(message);
    this.name = 'AIValidationError';
  }
}

export class AITimeoutError extends Error {
  constructor(message: string = 'AI request timed out') {
    super(message);
    this.name = 'AITimeoutError';
  }
}

export class AIRateLimitError extends Error {
  constructor(message: string = 'AI service rate limit exceeded') {
    super(message);
    this.name = 'AIRateLimitError';
  }
}

export class AIResponseError extends Error {
  constructor(message: string, public originalError?: Error) {
    super(message);
    this.name = 'AIResponseError';
  }
}

export class AINetworkError extends Error {
  constructor(message: string = 'AI service network error') {
    super(message);
    this.name = 'AINetworkError';
  }
}

export class AIUnavailableError extends Error {
  constructor(message: string = 'AI service unavailable') {
    super(message);
    this.name = 'AIUnavailableError';
  }
}

/**
 * Attempts to repair common JSON syntax errors.
 * This is a best-effort repair function for malformed AI responses.
 */
function attemptJsonRepair(text: string): string {
  let repaired = text;

  // Remove trailing commas before closing brackets/braces
  repaired = repaired.replace(/,\s*([}\]])/g, '$1');

  // Fix missing commas between array elements
  repaired = repaired.replace(/}\s*{/g, '},{');
  repaired = repaired.replace(/]\s*\[/g, '],[');

  // Fix missing commas between object properties
  repaired = repaired.replace(/"\s*"/g, '","');

  return repaired;
}

/**
 * Safe JSON parsing utility that never throws.
 * Handles empty strings, markdown wrapping, and malformed JSON.
 * Includes attempt to repair common JSON syntax errors.
 */
export function safeParseJson(text: string | undefined | null): SafeParseResult {
  if (!text || typeof text !== 'string') {
    return {
      success: false,
      error: 'Input is empty or not a string',
    };
  }

  const trimmed = text.trim();

  if (trimmed === '') {
    return {
      success: false,
      error: 'Input is empty',
    };
  }

  // Remove markdown code blocks if present
  const cleaned = trimmed
    .replace(/^```(?:json)?/i, '')
    .replace(/```$/i, '')
    .trim();

  if (cleaned === '') {
    return {
      success: false,
      error: 'No content after cleaning',
    };
  }

  // First attempt: parse as-is
  try {
    const parsed = JSON.parse(cleaned);
    return {
      success: true,
      data: parsed,
    };
  } catch (error) {
    // Second attempt: try to repair common JSON errors
    try {
      const repaired = attemptJsonRepair(cleaned);
      const parsed = JSON.parse(repaired);
      return {
        success: true,
        data: parsed,
      };
    } catch (repairError) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown parse error',
      };
    }
  }
}

/**
 * Validates Gemini feature estimate response.
 * Returns structured validation errors without throwing.
 */
export function validateFeatureEstimateResponse(
  response: unknown,
  expectedFeatureCount?: number
): ValidationResult {
  const errors: string[] = [];

  // Check if response exists
  if (!response || typeof response !== 'object') {
    return {
      valid: false,
      errors: ['Response is missing or not an object'],
    };
  }

  const data = response as Record<string, unknown>;

  // Check featureEstimates exists
  if (!data.featureEstimates) {
    errors.push('Missing required field: featureEstimates');
    return { valid: false, errors };
  }

  // Check featureEstimates is an array
  if (!Array.isArray(data.featureEstimates)) {
    errors.push('featureEstimates must be an array');
    return { valid: false, errors };
  }

  // Check array is not empty
  if (data.featureEstimates.length === 0) {
    errors.push('featureEstimates array is empty');
    return { valid: false, errors };
  }

  // Check expected feature count if provided
  if (expectedFeatureCount && data.featureEstimates.length !== expectedFeatureCount) {
    errors.push(`Expected ${expectedFeatureCount} feature estimates, got ${data.featureEstimates.length}`);
  }

  // Validate each feature estimate
  const validComplexities = ['Simple', 'Medium', 'Complex', 'Very Complex'];
  
  data.featureEstimates.forEach((estimate, index) => {
    if (!estimate || typeof estimate !== 'object') {
      errors.push(`Feature estimate at index ${index} is not an object`);
      return;
    }

    const estimateObj = estimate as Record<string, unknown>;

    // Check feature field
    if (!estimateObj.feature || typeof estimateObj.feature !== 'string') {
      errors.push(`Feature estimate at index ${index} missing or invalid 'feature' field`);
    }

    // Check estimatedHours field
    if (typeof estimateObj.estimatedHours !== 'number' || estimateObj.estimatedHours <= 0) {
      errors.push(`Feature estimate at index ${index} missing or invalid 'estimatedHours' field`);
    }

    // Check complexity field
    if (!estimateObj.complexity || typeof estimateObj.complexity !== 'string') {
      errors.push(`Feature estimate at index ${index} missing or invalid 'complexity' field`);
    } else if (!validComplexities.includes(estimateObj.complexity as string)) {
      errors.push(`Feature estimate at index ${index} has invalid complexity: ${estimateObj.complexity}`);
    }
  });

  // Validate optional fields if present
  if (data.riskFactors && !Array.isArray(data.riskFactors)) {
    errors.push('riskFactors must be an array if present');
  }

  if (data.recommendations && !Array.isArray(data.recommendations)) {
    errors.push('recommendations must be an array if present');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Creates a timeout promise that rejects after specified milliseconds.
 */
export function createTimeoutPromise(timeoutMs: number): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new AITimeoutError()), timeoutMs);
  });
}

/**
 * Wraps a promise with timeout protection.
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number
): Promise<T> {
  return Promise.race([
    promise,
    createTimeoutPromise(timeoutMs),
  ]);
}

/**
 * Retry configuration
 */
export interface RetryConfig {
  maxRetries: number;
  retryableErrors: string[];
  delays: number[];
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  retryableErrors: ['timeout', '429', '500', '503', 'ECONNRESET', 'ETIMEDOUT'],
  delays: [1000, 2000], // Wait 1s, then 2s between retries
};

/**
 * Executes a function with retry logic for transient failures.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Check if error is retryable
      const errorMessage = lastError.message.toLowerCase();
      const isRetryable = config.retryableErrors.some(
        retryableError => errorMessage.includes(retryableError.toLowerCase())
      );

      if (!isRetryable) {
        throw lastError;
      }

      // Don't wait after last attempt
      if (attempt < config.maxRetries) {
        const delay = config.delays[Math.min(attempt, config.delays.length - 1)];
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError!;
}

/**
 * Centralized AI error handler.
 * Converts technical errors into user-safe messages.
 */
export function handleAIError(error: unknown): string {
  if (error instanceof AITimeoutError) {
    return 'AI service took too long to respond. Please try again.';
  }

  if (error instanceof AIRateLimitError) {
    return 'AI service is temporarily busy. Please try again in a few minutes.';
  }

  if (error instanceof AIValidationError) {
    return 'AI returned invalid data. Please try again.';
  }

  if (error instanceof AIResponseError) {
    return 'AI service encountered an error. Please try again.';
  }

  if (error instanceof AINetworkError) {
    return 'Network error connecting to AI service. Please check your connection.';
  }

  if (error instanceof AIUnavailableError) {
    return 'AI service is currently unavailable. Please try again later.';
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    
    if (message.includes('timeout') || message.includes('timed out')) {
      return 'AI service took too long to respond. Please try again.';
    }
    
    if (message.includes('429') || message.includes('rate limit') || message.includes('quota')) {
      return 'AI service is temporarily busy. Please try again in a few minutes.';
    }
    
    if (message.includes('500') || message.includes('503')) {
      return 'AI service is temporarily unavailable. Please try again.';
    }
    
    if (message.includes('network') || message.includes('econnrefused') || message.includes('enotfound')) {
      return 'Network error connecting to AI service. Please check your connection.';
    }
  }

  return 'AI service unavailable. Please try again later.';
}

/**
 * Structured logging for AI operations.
 */
export interface AILogEntry {
  requestId?: string;
  projectId?: string;
  operation: string;
  errorType?: string;
  errorMessage?: string;
  validationErrors?: string[];
  timestamp: string;
}

export function logAIError(entry: AILogEntry): void {
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('[AI Error]', JSON.stringify(entry, null, 2));
  }
  
  // In production, this would log to a proper logging service
  // e.g., Winston, Datadog, CloudWatch, etc.
  // Never log API keys or secrets
}

export function logAISuccess(entry: Omit<AILogEntry, 'errorType' | 'errorMessage' | 'validationErrors'>): void {
  if (process.env.NODE_ENV === 'development') {
    console.log('[AI Success]', JSON.stringify(entry, null, 2));
  }
}

/**
 * Fallback response for AI unavailability
 */
export interface AIFallbackResponse {
  success: false;
  reason: "AI_UNAVAILABLE";
  message: string;
}

export function createAIFallbackResponse(message: string): AIFallbackResponse {
  return {
    success: false,
    reason: "AI_UNAVAILABLE",
    message,
  };
}
