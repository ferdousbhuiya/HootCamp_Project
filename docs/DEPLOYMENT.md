# Deployment Guide

## Prerequisites

- GitHub repository
- Supabase project
- Vercel account
- Node.js 18+
- Production AI provider key

## Supabase setup

1. Create a Supabase project.
2. Enable Email authentication.
3. Create application tables and policies.
4. Create private storage bucket for resume documents.
5. Copy project URL and anon key.

## Environment variables

Configure these in Vercel Project Settings → Environment Variables:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
OPENAI_API_KEY=...
LMSTUDIO_BASE_URL=http://127.0.0.1:1234/v1
LMSTUDIO_MODEL=llama-3.2-3b-instruct
```

LM Studio is local-only. Do not use `127.0.0.1` as production AI endpoint unless deployment runs on same machine.

## Local verification

```bash
npm install
npm run lint
npm run build
npm run dev
```

Verify:

- `/upload` loads.
- Authentication pages work.
- Upload accepts supported files.
- Skills appear and are editable.
- Jobs, Learning Paths, and Certificates tabs work.
- No browser console errors.

## Vercel deployment

1. Push repository to GitHub.
2. Import repository into Vercel.
3. Select Next.js framework preset.
4. Add environment variables.
5. Deploy.
6. Add deployed URL to Supabase Auth redirect URLs.
7. Test production login and upload flow.

## Production checklist

- Production AI provider configured.
- Supabase RLS policies enabled.
- Storage bucket private.
- Authentication redirect URL configured.
- No secrets committed to git.
- `npm run build` passes.
- Demo flow recorded.

## Rollback

Vercel keeps previous deployments. Use Vercel deployment history to promote last known-good deployment. Revert corresponding git commit if database schema changed.
