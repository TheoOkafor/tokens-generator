import type { NextRequest } from 'next/server';

/**
 * Validates API key from X-API-Key header
 * Returns true if valid, false otherwise
 */
export function validateApiKey(request: NextRequest): boolean {
  const apiKey = request.headers.get('X-API-Key');
  const expectedApiKey = process.env.API_KEY;

  // If no API key is configured, skip authentication (dev mode)
  if (!expectedApiKey) {
    console.warn('Warning: API_KEY not configured. Authentication is disabled.');
    return true;
  }

  return apiKey === expectedApiKey;
}
