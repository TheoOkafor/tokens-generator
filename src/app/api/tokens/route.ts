import { NextRequest } from 'next/server';
import { createTokenController, getTokensController } from '@/tokens/token.controller';

/**
 * POST /api/tokens
 * Creates a new access token for a user
 * 
 * Request body:
 * {
 *   "userId": "123",
 *   "scopes": ["read", "write"],
 *   "expiresInMinutes": 60
 * }
 * 
 * Response: 201 Created with token details
 */
export async function POST(request: NextRequest) {
  return createTokenController(request);
}

/**
 * GET /api/tokens?userId=123
 * Retrieves all non-expired tokens for a user
 * 
 * Query parameters:
 * - userId (required): The user identifier
 * 
 * Response: 200 OK with array of tokens
 */
export async function GET(request: NextRequest) {
  return getTokensController(request);
}
