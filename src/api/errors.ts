/**
 * Centralized error handling for API layer.
 * 
 * Architecture Note: Consistent error types enable predictable error handling
 * in UI components and better debugging. Extends Supabase's error types.
 */

import { PostgrestError } from "@supabase/supabase-js";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly originalError?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class NotFoundError extends ApiError {
  constructor(resource: string, id?: string) {
    super(
      id ? `${resource} with id ${id} not found` : `${resource} not found`,
      "NOT_FOUND"
    );
    this.name = "NotFoundError";
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, public readonly field?: string) {
    super(message, "VALIDATION_ERROR");
    this.name = "ValidationError";
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = "Unauthorized access") {
    super(message, "UNAUTHORIZED");
    this.name = "UnauthorizedError";
  }
}

/**
 * Converts Supabase PostgrestError to our ApiError.
 * Architecture Note: Centralized conversion ensures consistent error handling.
 */
export function handleSupabaseError(error: PostgrestError): ApiError {
  // Handle common Supabase error codes
  if (error.code === "PGRST116") {
    return new NotFoundError("Resource");
  }

  if (error.code === "23505") {
    // Unique constraint violation
    return new ValidationError(
      "A record with this value already exists",
      error.message
    );
  }

  if (error.code === "23503") {
    // Foreign key violation
    return new ValidationError(
      "Referenced record does not exist",
      error.message
    );
  }

  if (error.code === "42501") {
    return new UnauthorizedError("Insufficient permissions");
  }

  return new ApiError(
    error.message || "Database error occurred",
    error.code,
    error
  );
}

/**
 * Type guard to check if error is an ApiError.
 */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}
