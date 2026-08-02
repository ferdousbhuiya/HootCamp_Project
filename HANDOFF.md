# Skills Pathfinder — Handoff Note

**Date:** 2026-08-02
**Purpose:** Resume point. Professor feedback expected after Week 3 gate review. Read this first when work resumes.

---

## Status: COMPLETE & LIVE

- **Prod:** https://skills-pathfinder.vercel.app
- **Working repo:** `E:\FAU_Courses\Summer_2026\HootCamp\Project_Final\Project` (branch `claude/dashboard-and-upload-improvements`, auto-deploys to Vercel on push to `master`)
- **Classroom repo:** https://github.com/FAU-AI-HootCamp-Summer-2026/buildphase-ferdousbhuiya (docs + code, main branch)
- **Local dev:** `npm run dev` → http://localhost:3000

## Built Features

### Core
- Upload resume/cert/course (PDF/DOCX/DOC/TXT) → AI skill extraction + cert metadata
- Matches page (Jobs / Learning Paths / Credentials) — AI-generated, explainable
- Career report → multi-page PDF download
- Auth (Supabase email/password), protected routes, session cookies
- Dashboard: portfolio score (0-100) + skill distribution charts

### Career Compass (4 AI features)
1. **Role comparison** — compare 2-3 roles side-by-side (match %, coverage, salary, demand, missing skills, courses). Cached analyses reused.
2. **AI portfolio feedback** — strengths, weaknesses, missing employer keywords, suggestions.
3. **Goal progress tracking** — set active goal, baseline captured, progress over time (coverage, skills/courses acquired, roadmap phases). Deterministic, no AI per read.
4. **AI career advisor chat** (`/advisor`) — portfolio-grounded multi-turn chat with course catalog + safety rules. Session memory.

## Database
- Supabase migrations `001`–`009` (all applied to prod)
- Migration 009: `career_goals.is_active` + `baseline` + partial unique index (one active goal per user)

## Known Prod Constraints
- **OCR disabled in prod** (tesseract exceeds Vercel free-tier limits). Scanned PDFs/images fail with clear message → manual form. Works locally. Enable = Vercel Pro.
- **PDF text extraction** uses `unpdf` (pdf-parse/pdfjs worker broken on Vercel).
- **CSP** needs `script-src 'unsafe-inline'` for Next.js hydration (deployed).

## Deploy Info
- GitHub Actions auto-deploy on push to `master` (working repo). Classroom repo has NO deploy workflow (builds stuck on Vercel).
- Env vars on Vercel: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `GROQ_API_KEY`.
- Deploy command (if needed): `vercel --prod` (from working repo).

## To Do When Resuming
- [ ] **Get professor feedback** on Week 3 gate submission
- [ ] Apply feedback to plan.md / design.md / code as needed
- [ ] Add demo video link to classroom README (`*(link to be added)*`)
- [ ] Any fixes/changes from professor → update working repo → push to master (auto-deploys) → sync changed files to classroom repo

## Class Repo Sync Notes
- Working repo has nested `buildphase-ferdousbhuiya/` clone (gitignored in working repo). After code changes: copy changed `src/` + `supabase/` + docs into it, commit, push to classroom `main`.
- Never commit: `.env`, `eng.traineddata` (gitignored), Vercel tokens.
