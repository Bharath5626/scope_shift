/**
 * Centralized database error handler.
 * Maps Prisma errors to user-safe messages.
 */

export class DatabaseError extends Error {
  constructor(message: string, public originalCode?: string, public originalMessage?: string) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export class DuplicateRecordError extends DatabaseError {
  constructor(message: string, originalMessage?: string) {
    super(message, 'P2002', originalMessage);
    this.name = 'DuplicateRecordError';
  }
}

export class InvalidRelationError extends DatabaseError {
  constructor(message: string, originalMessage?: string) {
    super(message, 'P2003', originalMessage);
    this.name = 'InvalidRelationError';
  }
}

export class RecordNotFoundError extends DatabaseError {
  constructor(message: string, originalMessage?: string) {
    super(message, 'P2025', originalMessage);
    this.name = 'RecordNotFoundError';
  }
}

export class DatabaseUnavailableError extends DatabaseError {
  constructor(message: string, originalMessage?: string) {
    super(message, 'P1001', originalMessage);
    this.name = 'DatabaseUnavailableError';
  }
}

export class DatabaseTimeoutError extends DatabaseError {
  constructor(message: string, originalMessage?: string) {
    super(message, 'P1008', originalMessage);
    this.name = 'DatabaseTimeoutError';
  }
}

/**
 * Handles database errors and converts them to user-safe messages.
 */
export function handleDatabaseError(error: unknown): DatabaseError {
  if (error instanceof DatabaseError) {
    return error;
  }

  if (error instanceof Error) {
    const message = error.message;
    const code = (error as any).code; // Prisma errors have a 'code' property
    
    // P2002: Unique constraint violation
    if (code === 'P2002' || message.includes('P2002') || message.includes('Unique constraint')) {
      // Check if it's an analysis duplicate
      if (message.includes('Analysis') || message.includes('analysisHash') || message.includes('projectId_analysisHash')) {
        return new DuplicateRecordError(
          'Analysis already exists for this feature set.',
          error.message
        );
      }
      return new DuplicateRecordError(
        'A record with this information already exists.',
        error.message
      );
    }

    // P2003: Foreign key constraint violation
    if (code === 'P2003' || message.includes('P2003') || message.includes('Foreign key constraint')) {
      return new InvalidRelationError(
        'Invalid reference to another record.',
        error.message
      );
    }

    // P2025: Record not found
    if (code === 'P2025' || message.includes('P2025') || message.includes('Record not found')) {
      return new RecordNotFoundError(
        'The requested record was not found.',
        error.message
      );
    }

    // P1001: Database unavailable
    if (code === 'P1001' || message.includes('P1001') || message.includes('Database unavailable')) {
      return new DatabaseUnavailableError(
        'Database is currently unavailable. Please try again.',
        error.message
      );
    }

    // P1008: Database timeout
    if (code === 'P1008' || message.includes('P1008') || message.includes('Database timeout')) {
      return new DatabaseTimeoutError(
        'Database request timed out. Please try again.',
        error.message
      );
    }

    // Generic database error - include code if available
    return new DatabaseError(
      'A database error occurred. Please try again.',
      code || error.message
    );
  }

  return new DatabaseError(
    'An unknown database error occurred.',
    String(error)
  );
}

/**
 * Gets appropriate HTTP status code for database errors.
 */
export function getDatabaseErrorStatusCode(error: DatabaseError): number {
  switch (error.originalCode) {
    case 'P2002':
      return 409; // Conflict
    case 'P2003':
      return 400; // Bad Request
    case 'P2025':
      return 404; // Not Found
    case 'P1001':
    case 'P1008':
      return 503; // Service Unavailable
    default:
      return 500; // Internal Server Error
  }
}
