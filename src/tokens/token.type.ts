/**
 * Core token type matching the database schema
 */
export interface Token {
  id: string;
  token: string;
  userId: string;
  scopes: string[];
  createdAt: Date;
  expiresAt: Date;
}

/**
 * Request payload for creating a new token
 */
export interface CreateTokenRequest {
  userId: string;
  scopes: string[];
  expiresInMinutes: number;
}

/**
 * Response format for token operations
 * Serializes dates as ISO strings for JSON compatibility
 */
export interface TokenResponse {
  id: string;
  token: string;
  userId: string;
  scopes: string[];
  createdAt: string;
  expiresAt: string;
}

/**
 * Error response format
 */
export interface ErrorResponse {
  error: string;
  details?: unknown;
}
