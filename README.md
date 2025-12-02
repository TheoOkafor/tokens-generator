# Token Management Service

A minimal API service for managing user access tokens with TypeScript, Next.js, PostgreSQL, and Prisma.

## Stack & Technology Choices

**Framework**: Next.js 14 (App Router)
- Built-in API routes with App Router
- Excellent TypeScript support
- Wide adoption and mature ecosystem
- Simple deployment options

**Database**: PostgreSQL 16
- Production-ready relational database
- Native array support for scopes
- Excellent Prisma integration

**ORM**: Prisma
- Type-safe database access
- Automatic migrations
- Great developer experience

**Validation**: Zod
- Runtime type validation
- Clear error messages
- TypeScript inference

**Testing**: Jest
- Next.js recommended
- Mature ecosystem
- Good TypeScript support

**Token Generation**: `crypto.randomUUID()`
- 122 bits of entropy (secure)
- Built-in Node.js module
- Standard UUID v4 format
- Prefix for identifiability

## Prerequisites

- Node.js 20+
- Docker & Docker Compose
- npm

## Running the Project

### Option 1: With Docker Compose (Recommended)

**Start everything (database + app):**
```bash
npm install
npm run docker:restart
```

The application will be available at `http://localhost:3000`

**Useful Docker commands:**
```bash
npm run docker:up        # Start containers
npm run docker:down      # Stop containers
npm run docker:logs      # View logs
npm run docker:restart   # Rebuild and restart
```

### Option 2: Without Docker (Local Development)

**1. Start PostgreSQL:**
```bash
docker-compose up postgres -d
```

**2. Setup environment:**
```bash
cp .env.example .env
```

Edit `.env` with your database credentials.

**3. Install dependencies:**
```bash
npm install
```

**4. Run migrations:**
```bash
npx prisma migrate dev
npx prisma generate
```

**5. Start development server:**
```bash
npm run dev
```

Access at `http://localhost:3000`

## Running Tests

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch
```

## API Usage

### Create Token
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

### List Tokens
```bash
curl -X GET "http://localhost:3000/api/tokens?userId=user123" \
  -H "X-API-Key: dev-secret-key-12345"
```

## Database Management

```bash
# View database in browser
npx prisma studio

# Create new migration
npx prisma migrate dev --name description

# Reset database
npx prisma migrate reset
```

## Project Structure

```
├── src/
│   ├── app/
│   │   ├── api/tokens/route.ts    # API endpoints
│   │   └── page.tsx               # Web UI
│   ├── lib/
│   │   ├── auth.ts                # API key auth
│   │   └── db.ts                  # Prisma client
│   └── tokens/
│       ├── token.controller.ts    # Request handlers
│       ├── token.service.ts       # Business logic
│       ├── token.validation.ts    # Zod schemas
│       └── token.type.ts          # TypeScript types
├── prisma/
│   └── schema.prisma              # Database schema
├── docker-compose.yml
└── Dockerfile
```

## Assumptions & Simplifications

1. **Authentication**: Simple API key via header (sufficient for service-to-service communication). Production would need OAuth2/JWT.

2. **Token Storage**: Tokens stored as plain text. For long-lived tokens, consider hashing (though this prevents returning the token to the user).

3. **Expiry**: Maximum token lifetime is 1 year (525,600 minutes). No token revocation endpoint implemented.

4. **Error Handling**: Generic error messages to avoid leaking internal details. Detailed errors logged server-side.

5. **Rate Limiting**: Not implemented. Production should add rate limiting (e.g., with Redis).

6. **HTTPS**: Assumes reverse proxy (nginx/Caddy) handles TLS in production.

7. **Scalability**: Single database instance. For high scale, consider read replicas and connection pooling.

8. **Frontend**: Basic UI for testing. Production would need proper error handling, loading states, and accessibility.

9. **Database Indexes**: Indexes on `userId` and `expiresAt` for query performance. Additional indexes may be needed based on usage patterns.

10. **Environment Variables**: Loaded from `.env` file. Production should use proper secrets management (AWS Secrets Manager, etc.).

## Environment Variables

```env
DATABASE_URL="postgresql://tokenuser:tokenpass@localhost:5432/tokens_db"
API_KEY="your-secret-api-key-change-me"
NODE_ENV="development"
DB_USER="tokenuser"
DB_PASSWORD="tokenpass"
DB_NAME="tokens_db"
```
