import crypto from 'crypto';

/**
 * Generates a SHA256 hash of a feature set for duplicate analysis detection.
 * @param features - Array of feature objects with title, complexity, and estimatedHours
 * @returns SHA256 hash string
 */
export function generateAnalysisHash(features: Array<{
  feature: string;
  complexity: string;
  estimatedHours: number;
}>): string {
  // Sort features by title to ensure consistent hashing regardless of order
  const sortedFeatures = [...features].sort((a, b) => a.feature.localeCompare(b.feature));
  
  // Create a canonical string representation
  const canonicalString = JSON.stringify(sortedFeatures);
  
  // Generate SHA256 hash
  return crypto.createHash('sha256').update(canonicalString).digest('hex');
}
