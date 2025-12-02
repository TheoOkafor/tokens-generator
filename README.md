# Token Management Service

A minimal, clean, and technically sound API service for managing user access tokens, built with Next.js 14 (App Router), TypeScript, PostgreSQL, and Prisma.

## Features

- ✅ Create access tokens with custom scopes and expiry
- ✅ List all active (non-expired) tokens for a user
- ✅ Type-safe API with TypeScript and Zod validation
- ✅ PostgreSQL database with Prisma ORM
- ✅ API key authentication
- ✅ Simple web interface for testing
- ✅ Unit tests with Jest
- ✅ Docker support

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL 16
- **ORM**: Prisma
- **Validation**: Zod
- **Testing**: Jest + React Testing Library
- **Styling**: Tailwind CSS

## Project Structure

```
token-service/
├── app/
│   ├── api/tokens/
│   │   └── route.ts          # API endpoints (POST & GET)
│   ├── layout.tsx
│   └── page.tsx              # Web UI
├── lib/
│   ├── auth.ts               # API key authentication
│   ├── db.ts                 # Prisma client singleton
│   ├── token-service.ts      # Core business logic
│   └── validation.ts         # Zod schemas
├── types/
│   └── token.ts              # TypeScript interfaces
├── prisma/
│   └── schema.prisma         # Database schema
├── __tests__/
│   ├── token-service.test.ts
│   └── validation.test.ts
├── docker-compose.yml        # PostgreSQL container
├── Dockerfile                # Application container
└── README.md
```

## API Endpoints

### POST /api/tokens

Create a new access token.

**Headers:**
```
X-API-Key: your-api-key
Content-Type: application/json
```

**Request Body:**
```json
{
  "userId": "user123",
  "scopes": ["read", "write"],
  "expiresInMinutes": 60
}
```

**Validation Rules:**
- `userId`: Non-empty string
- `scopes`: Array with at least one non-empty string
- `expiresInMinutes`: Positive integer, max 525600 (1 year)

**Response (201 Created):**
```json
{
  "id": "clxyz123...",
  "token": "token_9f0c2d6a-3b...",
  "userId": "user123",
  "scopes": ["read", "write"],
  "createdAt": "2025-12-01T10:00:00.000Z",
  "expiresAt": "2025-12-01T11:00:00.000Z"
}
```

### GET /api/tokens?userId=user123

Retrieve all non-expired tokens for a user.

**Headers:**
```
X-API-Key: your-api-key
```

**Query Parameters:**
- `userId` (required): User identifier

**Response (200 OK):**
```json
[
  {
    "id": "clxyz123...",
    "token": "token_9f0c2d6a-3b...",
    "userId": "user123",
    "scopes": ["read", "write"],
    "createdAt": "2025-12-01T10:00:00.000Z",
    "expiresAt": "2025-12-01T11:00:00.000Z"
  }
]
```

## Setup & Installation

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- npm or yarn

### Quick Start

1. **Clone and navigate to the project:**
   ```bash
   cd token-service
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Setup environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and configure:
   ```env
   DATABASE_URL="postgresql://tokenuser:tokenpass@localhost:5432/tokens_db"
   API_KEY="your-secret-api-key-change-me"
   NODE_ENV="development"
   ```

4. **Start PostgreSQL:**
   ```bash
   docker-compose up -d
   ```

5. **Run database migrations:**
   ```bash
   npx prisma migrate dev
   ```

6. **Generate Prisma Client:**
   ```bash
   npx prisma generate
   ```

7. **Start the development server:**
   ```bash
   npm run dev
   ```

8. **Access the application:**
   - Web UI: http://localhost:3000
   - API: http://localhost:3000/api/tokens

## Testing

Run unit tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

## Token Generation Strategy

**Format**: `token_<uuid>`

**Reasoning:**
- Uses Node.js built-in `crypto.randomUUID()` (UUID v4)
- Provides 122 bits of entropy (collision probability ~2.7×10⁻¹⁹)
- Prefix (`token_`) makes tokens easily identifiable in logs
- No external dependencies required
- Standard format, widely recognized

**Alternative considered:** `crypto.randomBytes()` with base64 encoding, but UUID is more standard and equally secure for this use case.

## Database Schema

```prisma
model Token {
  id        String   @id @default(cuid())
  token     String   @unique
  userId    String
  scopes    String[]
  createdAt DateTime @default(now())
  expiresAt DateTime
  
  @@index([userId])
  @@index([expiresAt])
}
```

**Design Decisions:**
- `id`: CUID for internal identifier
- `token`: The actual token string (unique)
- `scopes`: PostgreSQL array for multiple permissions
- Indexed on `userId` (frequent queries) and `expiresAt` (expiry filtering)

## Authentication

API endpoints are protected with API key authentication via the `X-API-Key` header.

Configure the API key in `.env`:
```env
API_KEY="your-secret-api-key"
```

**Note:** If `API_KEY` is not set, authentication is disabled (development only).

## Docker Deployment

### Build the Docker image:
```bash
docker build -t token-service .
```

### Run with Docker Compose:
```bash
docker-compose up -d
```

### Production considerations:
- Use environment-specific `.env` files
- Configure proper secrets management
- Set up reverse proxy (nginx/Caddy)
- Enable HTTPS/TLS
- Implement rate limiting

## Development

### Database Management

View database in Prisma Studio:
```bash
npx prisma studio
```

Create a new migration:
```bash
npx prisma migrate dev --name description_of_change
```

Reset database:
```bash
npx prisma migrate reset
```

### Code Quality

Lint code:
```bash
npm run lint
```

## Design Decisions Summary

| Aspect | Choice | Reasoning |
|--------|--------|-----------|
| **Framework** | Next.js App Router | Modern, widely adopted, excellent DX, built-in API routes |
| **Database** | PostgreSQL | Production-ready, relational model fits naturally, array support for scopes |
| **ORM** | Prisma | Type-safe, excellent TypeScript support, great migrations |
| **Validation** | Zod | Runtime type safety, clear error messages, TypeScript integration |
| **Token Format** | `token_` + UUID v4 | Secure, standard, identifiable, no dependencies |
| **Auth** | API Key Header | Simple, stateless, suitable for service-to-service |
| **Testing** | Jest | Next.js recommended, mature ecosystem, widely adopted |
| **Styling** | Tailwind CSS | Rapid UI development, utility-first |

## Security Considerations

- ✅ Input validation with Zod prevents injection attacks
- ✅ Prisma parameterized queries prevent SQL injection
- ✅ API key authentication protects endpoints
- ✅ Tokens stored as plain text (consider hashing for production if long-lived)
- ✅ Error messages don't leak internal details
- ⚠️ Consider implementing rate limiting for production
- ⚠️ Use HTTPS in production
- ⚠️ Rotate API keys regularly

## Limitations & Future Enhancements

**Current limitations:**
- No token revocation endpoint
- No rate limiting
- No audit logging
- Tokens stored unhashed

**Potential enhancements:**
- Token revocation/blacklisting
- Refresh token mechanism
- Granular permissions per scope
- Token usage analytics
- Rate limiting with Redis
- Audit trail for token operations
- WebAuthn/OAuth integration

## Testing the API

### Using curl:

**Create a token:**
```bash
curl -X POST http://localhost:3000/api/tokens \
  -H "Content-Type: application/json" \
  -H "X-API-Key: dev-secret-key-12345" \
  -d '{
    "userId": "user123",
    "scopes": ["read", "write"],
    "expiresInMinutes": 60
  }'
```

**List tokens:**
```bash
curl -X GET "http://localhost:3000/api/tokens?userId=user123" \
  -H "X-API-Key: dev-secret-key-12345"
```

## License

MIT

## Author

Built as a technical assessment demonstrating clean architecture, TypeScript proficiency, and modern web development practices.
