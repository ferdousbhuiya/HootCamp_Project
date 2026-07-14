# Skills Pathfinder Documentation

## Overview

Skills Pathfinder is an AI-powered web application that helps learners understand their skills and find career opportunities. Built for the FAU AI HootCamp Summer 2026 program.

## Documentation Files

- [README.md](../README.md) - Project overview and quick start
- [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture and data flow
- [DESIGN.md](DESIGN.md) - Design system and UI guidelines
- [GRADING-GATES.md](GRADING-GATES.md) - How each grading gate is addressed

## Key Features

### 1. Document Upload
Users can upload PDF, DOCX, or TXT files containing resumes, transcripts, or certificates.

### 2. Skill Extraction
AI analyzes uploaded documents and extracts skills with confidence scores using a hybrid approach:
- **LMStudio (Local)** - Free, offline development
- **OpenAI (Production)** - High-quality cloud processing

### 3. Match Recommendations
Based on extracted skills, the system recommends:
- Job roles
- Learning paths
- Credentials/certifications

### 4. Explainable Results
Each match includes:
- Why it matches the user's skills
- Which specific skills were matched
- Confidence scores

## Technical Details

### AI Integration
- Hybrid provider approach (LMStudio + OpenAI)
- Automatic fallback between providers
- Structured JSON output for consistent parsing

### Authentication
- Supabase Auth with email/password
- Protected routes via middleware
- Secure session management

### Database
- Supabase PostgreSQL
- User profiles, skills, and match history
- Row Level Security (RLS) enabled

## Development

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account (for auth/database)
- OpenAI API key (for production AI)
- LMStudio (optional, for local development)

### Local Development
```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your keys

# Start development server
npm run dev
```

### Deployment
The app is ready for deployment to Vercel:
```bash
npm run build
vercel deploy
```

## Grading Gates

See [GRADING-GATES.md](GRADING-GATES.md) for detailed coverage of each grading requirement.
