export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: any,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super('VALIDATION_ERROR', message, details);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AppError {
  constructor(message: string, details?: any) {
    super('NOT_FOUND', message, details);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string, details?: any) {
    super('CONFLICT', message, details);
    this.name = 'ConflictError';
  }
}

export class RepositoryError extends AppError {
  constructor(message: string, details?: any) {
    super('REPOSITORY_ERROR', message, details);
    this.name = 'RepositoryError';
  }
}
