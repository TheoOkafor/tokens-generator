import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { validateApiKey } from '@/lib/auth';
import { createTokenSchema, getTokensSchema } from '@/tokens/token.validation';
import { createToken, getActiveTokensForUser, serializeToken } from '@/tokens/token.service';
import type { ErrorResponse } from '@/tokens/token.type';

/**
 * Controller for creating a new access token
 * Handles authentication, validation, and token creation
 */
export async function createTokenController(request: NextRequest) {
  try {
    // Authenticate request
    if (!validateApiKey(request)) {
      return NextResponse.json<ErrorResponse>(
        { error: 'Unauthorized. Valid X-API-Key header required.' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = createTokenSchema.parse(body);

    // Create token
    const token = await createToken(
      validatedData.userId,
      validatedData.scopes,
      validatedData.expiresInMinutes
    );

    // Return serialized response
    return NextResponse.json(serializeToken(token), { status: 201 });

  } catch (error) {
    // Handle validation errors
    if (error instanceof ZodError) {
      return NextResponse.json<ErrorResponse>(
        {
          error: 'Validation failed',
          details: error.issues,
        },
        { status: 400 }
      );
    }

    // Handle other errors
    console.error('Error creating token:', error);
    return NextResponse.json<ErrorResponse>(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Controller for retrieving active tokens for a user
 * Handles authentication, validation, and token retrieval
 */
export async function getTokensController(request: NextRequest) {
  try {
    // Authenticate request
    if (!validateApiKey(request)) {
      return NextResponse.json<ErrorResponse>(
        { error: 'Unauthorized. Valid X-API-Key header required.' },
        { status: 401 }
      );
    }

    // Extract and validate query parameters
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    const validatedData = getTokensSchema.parse({ userId });

    // Retrieve active tokens
    const tokens = await getActiveTokensForUser(validatedData.userId);

    // Return serialized response
    return NextResponse.json(tokens.map(serializeToken), { status: 200 });

  } catch (error) {
    // Handle validation errors
    if (error instanceof ZodError) {
      return NextResponse.json<ErrorResponse>(
        {
          error: 'Validation failed',
          details: error.issues,
        },
        { status: 400 }
      );
    }

    // Handle other errors
    console.error('Error fetching tokens:', error);
    return NextResponse.json<ErrorResponse>(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
