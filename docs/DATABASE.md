# Database Design

## Overview

Skills Pathfinder uses Supabase PostgreSQL for authenticated user data, extracted skills, and career recommendations. Supabase Auth owns identity; application tables reference `auth.users.id`.

## Entity relationship model

```text
auth.users 1 ─── * resumes 1 ─── * skills
auth.users 1 ─── * matches
```

## Tables

### `resumes`

| Column | Type | Rules | Purpose |
|---|---|---|---|
| `id` | uuid | Primary key, generated | Resume identifier |
| `user_id` | uuid | Required, FK to `auth.users.id` | Owner |
| `file_name` | text | Required | Original filename |
| `file_type` | text | Required | PDF, DOCX, or TXT |
| `storage_path` | text | Required | Supabase Storage object path |
| `extracted_text` | text | Nullable | Parsed document text |
| `created_at` | timestamptz | Default `now()` | Upload time |

### `skills`

| Column | Type | Rules | Purpose |
|---|---|---|---|
| `id` | uuid | Primary key, generated | Skill identifier |
| `user_id` | uuid | Required, FK to `auth.users.id` | Owner |
| `resume_id` | uuid | Nullable, FK to `resumes.id` | Source document |
| `name` | text | Required | Skill name |
| `category` | text | Nullable | Technical, soft, tool, domain, etc. |
| `confidence` | numeric | 0–1 | AI confidence score |
| `source` | text | Nullable | Resume, transcript, certificate, user |
| `created_at` | timestamptz | Default `now()` | Creation time |

### `matches`

| Column | Type | Rules | Purpose |
|---|---|---|---|
| `id` | uuid | Primary key, generated | Recommendation identifier |
| `user_id` | uuid | Required, FK to `auth.users.id` | Owner |
| `match_type` | text | Required | `job`, `learning_path`, or `credential` |
| `title` | text | Required | Recommendation title |
| `organization` | text | Nullable | Employer or provider |
| `description` | text | Nullable | Recommendation summary |
| `match_score` | numeric | 0–1 | Overall fit score |
| `explanation` | text | Nullable | Explainable reason |
| `matched_skills` | jsonb | Nullable | Skills supporting match |
| `missing_skills` | jsonb | Nullable | Skills to develop |
| `created_at` | timestamptz | Default `now()` | Generation time |

## Security and integrity

- Row Level Security must be enabled on every user-owned table.
- Policies compare `user_id` with `auth.uid()` for select, insert, update, and delete.
- Foreign keys use `ON DELETE CASCADE` where child records must disappear with the owner/source.
- `confidence` and `match_score` accept values only from 0 through 1.
- Storage paths include the authenticated user ID to prevent collisions.
- Service-role credentials stay server-side and never enter browser bundles.

## Storage

A private `resumes` bucket stores uploaded source files. API routes use the authenticated session to validate ownership before reading or writing objects.

## Data lifecycle

1. User uploads source document.
2. Metadata and storage object are created.
3. Server extracts text and requests structured AI output.
4. Skills are persisted and editable by the owner.
5. Matches are generated from current skills.
6. User deletion removes owned records and source files according to configured retention policy.
