import { z } from 'zod';

/**
 * Validation schema for creating a new token
 * 
 * Rules:
 * - userId: non-empty string
 * - scopes: array with at least one non-empty string
 * - expiresInMinutes: positive integer, max 1 year (525600 minutes)
 */
export const createTokenSchema = z.object({
  userId: z.string().min(1, 'userId must not be empty'),
  scopes: z
    .array(z.string().min(1, 'Each scope must be a non-empty string'))
    .min(1, 'At least one scope is required'),
  expiresInMinutes: z
    .number()
    .int('expiresInMinutes must be an integer')
    .positive('expiresInMinutes must be positive')
    .max(525600, 'expiresInMinutes cannot exceed 1 year (525600 minutes)'),
});

/**
 * Validation schema for querying tokens by userId
 */
export const getTokensSchema = z.object({
  userId: z.string().min(1, 'userId must not be empty'),
});

/**
 * Type inference from schemas for TypeScript
 */
export type CreateTokenInput = z.infer<typeof createTokenSchema>;
export type GetTokensInput = z.infer<typeof getTokensSchema>;
