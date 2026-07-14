# Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Client (Browser)                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │  Next.js UI │  │  Components │  │    Hooks    │     │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘     │
└─────────┼────────────────┼────────────────┼─────────────┘
          │                │                │
          ▼                ▼                ▼
┌─────────────────────────────────────────────────────────┐
│                    API Layer (Next.js)                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │ /api/upload │  │ /api/skills │  │/api/matches │     │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘     │
└─────────┼────────────────┼────────────────┼─────────────┘
          │                │                │
          ▼                ▼                ▼
┌─────────────────────────────────────────────────────────┐
│                    Services Layer                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │  Supabase   │  │  AI Parser  │  │   Matcher   │     │
│  │  (Auth/DB)  │  │ (PDF/DOCX)  │  │  (OpenAI)   │     │
│  └─────────────┘  └──────┬──────┘  └──────┬──────┘     │
└──────────────────────────┼────────────────┼─────────────┘
                           │                │
                           ▼                ▼
┌─────────────────────────────────────────────────────────┐
│                    AI Providers                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │  LMStudio (Local Dev)  │  OpenAI (Production)   │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

## Data Flow

1. **User uploads document** via FileDropzone component
2. **API route receives file**, extracts text (PDF/DOCX/TXT)
3. **Text sent to AI parser** (LMStudio first, fallback to OpenAI)
4. **AI returns structured skills** with confidence scores
5. **Skills stored in Supabase** and displayed in UI
6. **User requests matches** via matcher API
7. **AI returns recommendations** (job/learning/credential)
8. **Matches displayed** with explanations

## Components

### Frontend Components

| Component | Location | Purpose |
|-----------|----------|---------|
| Button | `src/components/ui/Button.tsx` | Reusable button with variants |
| Card | `src/components/ui/Card.tsx` | Container component |
| Input | `src/components/ui/Input.tsx` | Form input with label/error |
| Badge | `src/components/ui/Badge.tsx` | Status indicator |
| Navbar | `src/components/layout/Navbar.tsx` | Top navigation |
| Sidebar | `src/components/layout/Sidebar.tsx` | Side navigation |
| FileDropzone | `src/components/upload/FileDropzone.tsx` | File upload area |
| SkillCard | `src/components/skills/SkillCard.tsx` | Single skill display |
| SkillGrid | `src/components/skills/SkillGrid.tsx` | Skills grid layout |
| MatchCard | `src/components/matches/MatchCard.tsx` | Match result card |
| MatchList | `src/components/matches/MatchList.tsx` | Matches list |
| ExplanationPanel | `src/components/matches/ExplanationPanel.tsx` | Match explanation |

### API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/upload` | POST | Upload file to Supabase Storage |
| `/api/skills` | POST | Extract skills from document |
| `/api/matches` | POST | Find matches for skills |

### Hooks

| Hook | Location | Purpose |
|------|----------|---------|
| useAuth | `src/hooks/useAuth.ts` | Authentication state |
| useSkills | `src/hooks/useSkills.ts` | Skills extraction |
| useMatches | `src/hooks/useMatches.ts` | Match finding |

## Security

- **Input Validation:** All API routes validate input
- **Supabase RLS:** Row Level Security policies enforce data isolation
- **API Keys:** Stored in environment variables, never in code
- **No Code Execution:** Read-only analysis of student code

## Deployment

- **Platform:** Vercel (optimized for Next.js)
- **Database:** Supabase Cloud
- **Storage:** Supabase Storage
- **AI:** OpenAI API (production) / LMStudio (dev)

## Scalability

- **Caching:** File-hash based embedding cache
- **Rate Limiting:** Exponential backoff for AI API calls
- **Lazy Loading:** Components loaded on demand
