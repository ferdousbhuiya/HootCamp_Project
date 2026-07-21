# Security Design

## Authentication

- **Supabase Auth**: email/password identity with secure JWT-based sessions.
- **Middleware**: `src/lib/supabase/middleware.ts` enforces authentication on all private routes.
- **Client library**: `@supabase/ssr` manages session cookies and tokens.

## Authorization

- **Row Level Security**: all user-owned tables use RLS.
- **Policies**: compare `user_id` to `auth.uid()` for `SELECT`, `INSERT`, `UPDATE`, `DELETE`.
- **RBAC**: only authenticated users can access `INSERT`, `UPDATE`, `DELETE` operations.

## Data security

- **Environment variables**: API keys and secrets in `.env`, never in source code.
- **File validation**: upload endpoint checks type and size limits.
- **Input validation**: API endpoints validate request shape and content.
- **Storage**: private buckets with user-scoped access policies.
- **Privacy**: documents are processed, not stored long-term without explicit consent.

## API security

- **Server-side secrets**: API keys for Supabase and OpenAI are used server-side only.
- **Rate limiting**: external services have rate limit and retry logic.
- **Error handling**: server returns generic errors, not raw provider messages.

## Frontend security

- **No exposed secrets**: browser bundles contain no keys.
- **CSRF**: Next.js App Router provides built-in protection.
- **XSS**: React automatically escapes content.

## Code security

- **Dependency management**: `npm audit` used to check for vulnerable dependencies.
- **Conventional commits**: git history is readable and accountable.
- **Secrets**: no hardcoded secrets in the repository.
