/**
 * Structured logging for database operations.
 */

export interface DatabaseLogEntry {
  timestamp: string;
  operation: string;
  projectId?: string;
  errorCode?: string;
  errorMessage?: string;
  duration?: number;
}

export function logDatabaseTransactionStart(operation: string, projectId?: string): void {
  const entry: DatabaseLogEntry = {
    timestamp: new Date().toISOString(),
    operation: `transaction_start_${operation}`,
    projectId,
  };
  
  if (process.env.NODE_ENV === 'development') {
    console.log('[DB Transaction Start]', JSON.stringify(entry, null, 2));
  }
}

export function logDatabaseTransactionSuccess(operation: string, projectId?: string, duration?: number): void {
  const entry: DatabaseLogEntry = {
    timestamp: new Date().toISOString(),
    operation: `transaction_success_${operation}`,
    projectId,
    duration,
  };
  
  if (process.env.NODE_ENV === 'development') {
    console.log('[DB Transaction Success]', JSON.stringify(entry, null, 2));
  }
}

export function logDatabaseTransactionRollback(operation: string, projectId?: string, errorCode?: string, errorMessage?: string): void {
  const entry: DatabaseLogEntry = {
    timestamp: new Date().toISOString(),
    operation: `transaction_rollback_${operation}`,
    projectId,
    errorCode,
    errorMessage,
  };
  
  if (process.env.NODE_ENV === 'development') {
    console.error('[DB Transaction Rollback]', JSON.stringify(entry, null, 2));
  }
}

export function logDatabaseAnalysisSaved(projectId: string, analysisId: string): void {
  const entry: DatabaseLogEntry = {
    timestamp: new Date().toISOString(),
    operation: 'analysis_saved',
    projectId,
  };
  
  if (process.env.NODE_ENV === 'development') {
    console.log('[DB Analysis Saved]', JSON.stringify(entry, null, 2));
  }
}

export function logDatabaseError(operation: string, errorCode?: string, errorMessage?: string, projectId?: string): void {
  const entry: DatabaseLogEntry = {
    timestamp: new Date().toISOString(),
    operation: `database_error_${operation}`,
    projectId,
    errorCode,
    errorMessage,
  };
  
  if (process.env.NODE_ENV === 'development') {
    console.error('[DB Error]', JSON.stringify(entry, null, 2));
  }
}
