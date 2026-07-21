# API Design

All private endpoints require an authenticated Supabase session. JSON responses use HTTP status codes to distinguish validation, authentication, provider, and server failures.

## `POST /api/upload`

Uploads a resume, transcript, or certificate.

### Request

```text
Content-Type: multipart/form-data
file: PDF, DOCX, or TXT
Maximum size: 10 MB
```

### Success response

```json
{
  "success": true,
  "resumeId": "uuid",
  "fileName": "resume.pdf"
}
```

### Errors

- `400`: missing file, unsupported type, or file too large
- `401`: unauthenticated
- `500`: storage or parsing failure

## `POST /api/skills`

Extracts structured skills from document text and stores them for the authenticated user.

### Request

```json
{
  "resumeId": "uuid",
  "text": "Resume or document text"
}
```

### Success response

```json
{
  "success": true,
  "skills": [
    {
      "name": "Python",
      "category": "Programming",
      "confidence": 0.92
    }
  ]
}
```

### Errors

- `400`: invalid or empty text
- `401`: unauthenticated
- `422`: AI output failed schema validation
- `500`: provider or database failure

## `GET /api/skills`

Returns current skills for authenticated user. Supports editing workflow and refreshes UI state.

### Errors

- `401`: unauthenticated
- `500`: database failure

## `POST /api/matches`

Generates explainable recommendations using current skills.

### Request

```json
{
  "skills": ["Python", "SQL", "React"]
}
```

### Success response

```json
{
  "success": true,
  "matches": [
    {
      "type": "job",
      "title": "Junior Data Analyst",
      "organization": "Example Company",
      "matchScore": 0.84,
      "matchedSkills": ["Python", "SQL"],
      "missingSkills": ["Tableau"],
      "explanation": "Strong match through Python and SQL experience."
    }
  ]
}
```

### Match categories

- `job`: employment recommendation
- `learning_path`: course or structured learning recommendation
- `credential`: certification or credential recommendation

## API principles

- Validate request shape before provider/database calls.
- Use authenticated user ID from the server session, never from client input.
- Return structured JSON suitable for React hooks.
- Do not expose provider keys or raw provider errors to browsers.
- Normalize provider output before persistence.
