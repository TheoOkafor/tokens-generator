import { randomUUID } from 'crypto';
import { prisma } from '@/lib/db';
import type { Token, TokenResponse } from '@/tokens/token.type';

/**
 * Generates a unique token string with identifiable prefix
 * Format: token_<uuid>
 * 
 * UUID v4 provides 122 bits of entropy, making collisions extremely unlikely.
 * The prefix makes tokens easily identifiable in logs and debugging.
 */
export function generateTokenString(): string {
  return `token_${randomUUID()}`;
}

/**
 * Calculates expiration date from current time and minutes
 */
export function calculateExpiryDate(expiresInMinutes: number): Date {
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + expiresInMinutes);
  return expiresAt;
}

/**
 * Checks if a token has expired
 */
export function isTokenExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt;
}

/**
 * Converts a Token with Date objects to TokenResponse with ISO strings
 * This is necessary for JSON serialization in API responses
 */
export function serializeToken(token: Token): TokenResponse {
  return {
    id: token.id,
    token: token.token,
    userId: token.userId,
    scopes: token.scopes,
    createdAt: token.createdAt.toISOString(),
    expiresAt: token.expiresAt.toISOString(),
  };
}

/**
 * Creates a new access token for a user
 * 
 * @param userId - The user identifier
 * @param scopes - Array of permission scopes
 * @param expiresInMinutes - Token lifetime in minutes
 * @returns The created token
 */
export async function createToken(
  userId: string,
  scopes: string[],
  expiresInMinutes: number
): Promise<Token> {
  const token = generateTokenString();
  const expiresAt = calculateExpiryDate(expiresInMinutes);

  const createdToken = await prisma.token.create({
    data: {
      token,
      userId,
      scopes,
      expiresAt,
    },
  });

  return createdToken;
}

/**
 * Retrieves all non-expired tokens for a specific user
 * 
 * @param userId - The user identifier
 * @returns Array of active tokens
 */
export async function getActiveTokensForUser(userId: string): Promise<Token[]> {
  const now = new Date();

  const tokens = await prisma.token.findMany({
    where: {
      userId,
      expiresAt: {
        gt: now, // Only tokens expiring in the future
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return tokens;
}

/**
 * Optional: Clean up expired tokens (maintenance function)
 * This could be called periodically or on-demand
 */
export async function deleteExpiredTokens(): Promise<number> {
  const now = new Date();

  const result = await prisma.token.deleteMany({
    where: {
      expiresAt: {
        lte: now,
      },
    },
  });

  return result.count;
}
