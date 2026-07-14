# Skills Pathfinder

**Connecting Talent to Opportunity** | FAU AI HootCamp Summer 2026

An AI-powered web application that turns resumes, transcripts, and certificates into clear next-step options for career growth.

## Features

- **Resume Parsing** - Upload PDF/DOCX and extract skills with AI
- **Skill Dashboard** - Visual display of inferred skills with confidence scores
- **Match Recommendations** - AI-powered job, learning path, and credential matching
- **Explainable Results** - Why each match fits, with editable suggestions
- **User Authentication** - Secure login with Supabase Auth

## Tech Stack

- **Frontend:** Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend:** Supabase (PostgreSQL + Auth + Storage)
- **AI:** OpenAI GPT-4o (production) + LMStudio (local dev)

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and add your keys
4. Run the dev server: `npm run dev`
5. Open http://localhost:3000

## Project Structure

```
src/
├── app/           # Next.js App Router pages
├── components/    # React components
├── lib/           # Supabase client, AI clients, utils
├── hooks/         # Custom React hooks
└── types/         # TypeScript types
```

## Grading Gates

| Gate | Status | Evidence |
|------|--------|----------|
| AI Integration | ✅ | OpenAI + LMStudio hybrid |
| Backend & Database | ✅ | Supabase PostgreSQL |
| Authentication | ✅ | Supabase Auth |
| Documentation | ✅ | README, ARCHITECTURE, DESIGN docs |
| Deployment | ✅ | Vercel ready |
| Demo Video | ⏳ | To be recorded |
| Commit Hygiene | ✅ | Conventional commits |

## License

MIT
