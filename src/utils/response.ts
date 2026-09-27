export interface SuccessResponse<T = unknown> {
  success: true;
  message: string;
  data: T;
}

export interface ErrorResponse {
  success: false;
  message: string;
  errors?: Array<{ field?: string; message: string }>;
}

export function successResponse<T>(data: T, message: string): SuccessResponse<T> {
  return {
    success: true,
    message,
    data,
  };
}

export function errorResponse(
  message: string,
  errors?: Array<{ field?: string; message: string }>,
): ErrorResponse {
  return {
    success: false,
    message,
    ...(errors && errors.length > 0 ? { errors } : {}),
  };
}
