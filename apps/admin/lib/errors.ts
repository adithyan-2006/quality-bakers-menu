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

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required', details?: any) {
    super('AUTHENTICATION_ERROR', message, details);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Permission denied', details?: any) {
    super('AUTHORIZATION_ERROR', message, details);
    this.name = 'AuthorizationError';
  }
}
