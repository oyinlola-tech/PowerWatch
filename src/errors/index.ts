export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errors: Array<{ field?: string; message: string }>;

  constructor(
    statusCode: number,
    message: string,
    errors: Array<{ field?: string; message: string }> = [],
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.name = 'AppError';
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
