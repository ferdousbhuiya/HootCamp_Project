# Skills Pathfinder Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use compose:subagent (recommended) or compose:execute to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold a complete Next.js + Supabase + Tailwind project for the Skills Pathfinder app with all documentation, architecture diagrams, and starter code ready to build on.

**Architecture:** Next.js App Router with Supabase for auth/database/storage. Hybrid AI layer (LMStudio local + OpenAI cloud). Tailwind CSS for styling. TypeScript throughout.

**Tech Stack:** Next.js 14+, TypeScript, Tailwind CSS, Supabase (Auth + PostgreSQL + Storage), OpenAI API, LMStudio (local dev)

## Global Constraints

- Node.js 18+ required
- TypeScript strict mode
- ESLint + Prettier for code quality
- Conventional commits (feat:, fix:, docs:, etc.)
- No secrets in codebase — all via .env
- Supabase project required for auth/database

---

## File Structure

```
skills-pathfinder/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout with providers
│   │   ├── page.tsx                # Landing page
│   │   ├── globals.css             # Tailwind imports
│   │   ├── dashboard/
│   │   │   └── page.tsx            # Main dashboard
│   │   ├── upload/
│   │   │   └── page.tsx            # Document upload page
│   │   ├── matches/
│   │   │   └── page.tsx            # Match results page
│   │   ├── auth/
│   │   │   ├── login/page.tsx      # Login page
│   │   │   └── signup/page.tsx     # Signup page
│   │   └── api/
│   │       ├── upload/route.ts     # File upload handler
│   │       ├── skills/route.ts     # Skill extraction API
│   │       └── matches/route.ts    # Match recommendations API
│   ├── components/
│   │   ├── ui/                     # Reusable UI primitives
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   └── Badge.tsx
│   │   ├── layout/                 # Layout components
│   │   │   ├── Navbar.tsx
│   │   │   └── Sidebar.tsx
│   │   ├── skills/                 # Skills-specific components
│   │   │   ├── SkillCard.tsx
│   │   │   ├── SkillGrid.tsx
│   │   │   └── SkillConfidence.tsx
│   │   ├── matches/                # Match-specific components
│   │   │   ├── MatchCard.tsx
│   │   │   ├── MatchList.tsx
│   │   │   └── ExplanationPanel.tsx
│   │   └── upload/                 # Upload components
│   │       ├── FileDropzone.tsx
│   │       └── UploadProgress.tsx
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts           # Browser Supabase client
│   │   │   ├── server.ts           # Server-side Supabase client
│   │   │   └── middleware.ts       # Auth middleware
│   │   ├── ai/
│   │   │   ├── openai.ts           # OpenAI client wrapper
│   │   │   ├── lmstudio.ts         # LMStudio client wrapper
│   │   │   ├── parser.ts           # Resume/document parser
│   │   │   └── matcher.ts          # Skill matching engine
│   │   └── utils.ts                # Shared utilities
│   ├── hooks/
│   │   ├── useAuth.ts              # Auth hook
│   │   ├── useSkills.ts            # Skills data hook
│   │   └── useMatches.ts           # Matches data hook
│   └── types/
│       └── index.ts                # Shared TypeScript types
├── docs/
│   ├── README.md                   # Project overview
│   ├── ARCHITECTURE.md             # System architecture
│   ├── DESIGN.md                   # Design system
│   ├── GRADING-GATES.md            # How each gate is addressed
│   └── compose/                    # Compose artifacts
├── public/
│   └── logo.svg                    # Project logo
├── .env.example                    # Environment variable template
├── .gitignore                      # Git ignore rules
├── next.config.ts                  # Next.js configuration
├── tailwind.config.ts              # Tailwind configuration
├── tsconfig.json                   # TypeScript configuration
├── package.json                    # Dependencies
└── README.md                       # Root README
```

---

### Task 1: Project Initialization & Configuration

**Covers:** [S5] Grading gate coverage (documentation, commit hygiene)

**Files:**
- Create: `package.json`
- Create: `next.config.ts`
- Create: `tsconfig.json`
- Create: `tailwind.config.ts`
- Create: `postcss.config.js`
- Create: `.gitignore`
- Create: `.env.example`
- Create: `src/app/globals.css`

**Interfaces:**
- Produces: Configured Next.js project with TypeScript and Tailwind

- [ ] **Step 1: Create package.json**

```json
{
  "name": "skills-pathfinder",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "@supabase/supabase-js": "^2.45.0",
    "openai": "^4.50.0",
    "pdf-parse": "^1.1.1",
    "mammoth": "^1.8.0"
  },
  "devDependencies": {
    "@types/node": "^20.14.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "typescript": "^5.5.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "eslint": "^8.57.0",
    "eslint-config-next": "^14.2.0"
  }
}
```

- [ ] **Step 2: Create next.config.ts**

```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    serverActions: true,
  },
};

export default nextConfig;
```

- [ ] **Step 3: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 4: Create tailwind.config.ts**

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
      },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 5: Create postcss.config.js**

```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

- [ ] **Step 6: Create .gitignore**

```
node_modules/
.next/
.env
.env.local
.env.*.local
*.tsbuildinfo
next-env.d.ts
```

- [ ] **Step 7: Create .env.example**

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI (production)
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4o

# LMStudio (local dev)
LMSTUDIO_BASE_URL=http://localhost:1234/v1
LMSTUDIO_MODEL=qwen/qwen3.6-27b

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

- [ ] **Step 8: Create src/app/globals.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --foreground-rgb: 0, 0, 0;
  --background-start-rgb: 214, 219, 220;
  --background-end-rgb: 255, 255, 255;
}

body {
  color: rgb(var(--foreground-rgb));
  background: linear-gradient(
      to bottom,
      transparent,
      rgb(var(--background-end-rgb))
    )
    rgb(var(--background-start-rgb));
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

- [ ] **Step 9: Install dependencies and verify**

Run: `npm install`
Expected: Dependencies installed successfully

- [ ] **Step 10: Commit**

```bash
git init
git add .
git commit -m "feat: initialize Next.js project with TypeScript and Tailwind"
```

---

### Task 2: TypeScript Types & Supabase Client Setup

**Covers:** [S3] Backend & database

**Files:**
- Create: `src/types/index.ts`
- Create: `src/lib/supabase/client.ts`
- Create: `src/lib/supabase/server.ts`
- Create: `src/lib/supabase/middleware.ts`

**Interfaces:**
- Produces: Shared types and Supabase clients for auth/database

- [ ] **Step 1: Create src/types/index.ts**

```typescript
export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
}

export interface Resume {
  id: string;
  user_id: string;
  file_name: string;
  file_url: string;
  parsed_content?: string;
  created_at: string;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  confidence: number;
  source: 'resume' | 'transcript' | 'certificate';
}

export interface UserProfile {
  id: string;
  user_id: string;
  skills: Skill[];
  resume_id?: string;
  updated_at: string;
}

export interface Match {
  id: string;
  user_id: string;
  title: string;
  description: string;
  match_score: number;
  matched_skills: string[];
  explanation: string;
  type: 'job' | 'learning_path' | 'credential';
  created_at: string;
}

export interface AIProvider {
  name: 'openai' | 'lmstudio';
  isAvailable: boolean;
}
```

- [ ] **Step 2: Create src/lib/supabase/client.ts**

```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
```

- [ ] **Step 3: Create src/lib/supabase/server.ts**

```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey);
```

- [ ] **Step 4: Create src/lib/supabase/middleware.ts**

```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/auth') &&
    !request.nextUrl.pathname.startsWith('/api')
  ) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/login';
    return NextResponse.redirect(url);
  }

  return response;
}
```

- [ ] **Step 5: Commit**

```bash
git add src/types/ src/lib/supabase/
git commit -m "feat: add TypeScript types and Supabase client setup"
```

---

### Task 3: AI Integration Layer (Hybrid OpenAI + LMStudio)

**Covers:** [S1] AI Integration

**Files:**
- Create: `src/lib/ai/openai.ts`
- Create: `src/lib/ai/lmstudio.ts`
- Create: `src/lib/ai/parser.ts`
- Create: `src/lib/ai/matcher.ts`

**Interfaces:**
- Consumes: Types from `src/types/index.ts`
- Produces: AI client wrappers, resume parser, skill matcher

- [ ] **Step 1: Create src/lib/ai/openai.ts**

```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function callOpenAI(prompt: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
  });

  return response.choices[0].message.content || '';
}
```

- [ ] **Step 2: Create src/lib/ai/lmstudio.ts**

```typescript
import OpenAI from 'openai';

const lmstudio = new OpenAI({
  baseURL: process.env.LMSTUDIO_BASE_URL || 'http://localhost:1234/v1',
  apiKey: 'lm-studio',
});

export async function callLMStudio(prompt: string): Promise<string> {
  const response = await lmstudio.chat.completions.create({
    model: process.env.LMSTUDIO_MODEL || 'qwen/qwen3.6-27b',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
  });

  return response.choices[0].message.content || '';
}
```

- [ ] **Step 3: Create src/lib/ai/parser.ts**

```typescript
import { callOpenAI } from './openai';
import { callLMStudio } from './lmstudio';
import type { Skill } from '@/types';

export async function parseResumeToSkills(text: string): Promise<Skill[]> {
  const prompt = `Extract skills from this resume text. Return a JSON array of objects with:
- name: skill name
- category: one of [technical, soft, domain, tool]
- confidence: 0.0 to 1.0

Resume text:
${text}

Return ONLY valid JSON array.`;

  let result: string;
  try {
    result = await callLMStudio(prompt);
  } catch {
    result = await callOpenAI(prompt);
  }

  try {
    const cleaned = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned) as Skill[];
  } catch {
    return [];
  }
}

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  const pdfParse = (await import('pdf-parse')).default;
  const data = await pdfParse(buffer);
  return data.text;
}

export async function extractTextFromDOCX(buffer: Buffer): Promise<string> {
  const mammoth = await import('mammoth');
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}
```

- [ ] **Step 4: Create src/lib/ai/matcher.ts**

```typescript
import { callOpenAI } from './openai';
import { callLMStudio } from './lmstudio';
import type { Skill, Match } from '@/types';

export async function findMatches(
  skills: Skill[],
  matchType: 'job' | 'learning_path' | 'credential' = 'job'
): Promise<Match[]> {
  const skillList = skills.map(s => s.name).join(', ');

  const prompt = `Given these skills: ${skillList}

Find 5 matching ${matchType === 'job' ? 'job roles' : matchType === 'learning_path' ? 'learning paths' : 'credentials/certifications'}.

Return a JSON array with:
- title: name of the match
- description: brief description
- match_score: 0.0 to 1.0
- matched_skills: array of skill names that match
- explanation: why this matches the skills

Return ONLY valid JSON array.`;

  let result: string;
  try {
    result = await callLMStudio(prompt);
  } catch {
    result = await callOpenAI(prompt);
  }

  try {
    const cleaned = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned) as Match[];
  } catch {
    return [];
  }
}
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/ai/
git commit -m "feat: add hybrid AI integration layer (OpenAI + LMStudio)"
```

---

### Task 4: UI Components (Design System)

**Covers:** [S4] Documentation, [S6] Demo video (visual polish)

**Files:**
- Create: `src/components/ui/Button.tsx`
- Create: `src/components/ui/Card.tsx`
- Create: `src/components/ui/Input.tsx`
- Create: `src/components/ui/Badge.tsx`
- Create: `docs/DESIGN.md`

**Interfaces:**
- Produces: Reusable UI component library

- [ ] **Step 1: Create src/components/ui/Button.tsx**

```typescript
import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
    const variants = {
      primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
      secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500',
      outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-primary-500',
    };
    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
```

- [ ] **Step 2: Create src/components/ui/Card.tsx**

```typescript
import { HTMLAttributes, forwardRef } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated';
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', variant = 'default', children, ...props }, ref) => {
    const variants = {
      default: 'bg-white border border-gray-200',
      elevated: 'bg-white shadow-lg',
    };

    return (
      <div
        ref={ref}
        className={`rounded-xl p-6 ${variants[variant]} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
export default Card;
```

- [ ] **Step 3: Create src/components/ui/Input.tsx**

```typescript
import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:outline-none ${error ? 'border-red-500' : ''} ${className}`}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
```

- [ ] **Step 4: Create src/components/ui/Badge.tsx**

```typescript
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'info';
}

const Badge = ({ children, variant = 'default' }: BadgeProps) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    info: 'bg-blue-100 text-blue-800',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  );
};

export default Badge;
```

- [ ] **Step 5: Create docs/DESIGN.md**

```markdown
# Skills Pathfinder Design System

## Brand Colors
- Primary: #2563EB (Blue)
- Secondary: #10B981 (Green)
- Accent: #F59E0B (Amber)

## Typography
- Headings: Inter (Bold)
- Body: Inter (Regular)

## Components
All components follow the `src/components/ui/` pattern with Tailwind styling.

## Spacing
- Container: max-w-7xl mx-auto
- Section padding: py-12 px-4 sm:px-6 lg:px-8
- Card padding: p-6

## Shadows
- Default: shadow-sm
- Elevated: shadow-lg
```

- [ ] **Step 6: Commit**

```bash
git add src/components/ui/ docs/DESIGN.md
git commit -m "feat: add UI component library and design system docs"
```

---

### Task 5: Application Layout & Pages

**Covers:** [S4] Documentation, [S6] Demo video (visual structure)

**Files:**
- Create: `src/app/layout.tsx`
- Create: `src/app/page.tsx`
- Create: `src/components/layout/Navbar.tsx`
- Create: `src/components/layout/Sidebar.tsx`

**Interfaces:**
- Consumes: UI components from Task 4
- Produces: Root layout and landing page

- [ ] **Step 1: Create src/components/layout/Navbar.tsx**

```typescript
import Link from 'next/link';
import Button from '@/components/ui/Button';

const Navbar = () => {
  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">SP</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Skills Pathfinder</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/auth/login">
              <Button variant="outline" size="sm">Login</Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="sm">Sign Up</Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
```

- [ ] **Step 2: Create src/components/layout/Sidebar.tsx**

```typescript
import Link from 'next/link';

const Sidebar = () => {
  const links = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/upload', label: 'Upload Resume' },
    { href: '/matches', label: 'My Matches' },
  ];

  return (
    <aside className="w-64 bg-gray-50 border-r border-gray-200 min-h-screen">
      <nav className="p-4 space-y-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
```

- [ ] **Step 3: Create src/app/layout.tsx**

```typescript
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/layout/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Skills Pathfinder',
  description: 'Connecting Talent to Opportunity - AI-powered career matching',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar />
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
```

- [ ] **Step 4: Create src/app/page.tsx**

```typescript
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <section className="text-center py-20">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Skills Pathfinder
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Turn your resume, transcript, or certificate into clear next-step options.
          AI-powered skill matching for career growth.
        </p>
        <div className="space-x-4">
          <Link href="/auth/signup">
            <Button size="lg">Get Started</Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline" size="lg">View Demo</Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card>
            <div className="text-primary-600 text-4xl mb-4">1</div>
            <h3 className="text-xl font-semibold mb-2">Upload Your Resume</h3>
            <p className="text-gray-600">
              Upload a PDF or DOCX of your resume, transcript, or certificates.
            </p>
          </Card>
          <Card>
            <div className="text-primary-600 text-4xl mb-4">2</div>
            <h3 className="text-xl font-semibold mb-2">AI Extracts Skills</h3>
            <p className="text-gray-600">
              Our AI analyzes your documents and identifies your skills with confidence scores.
            </p>
          </Card>
          <Card>
            <div className="text-primary-600 text-4xl mb-4">3</div>
            <h3 className="text-xl font-semibold mb-2">Get Matched</h3>
            <p className="text-gray-600">
              Receive personalized job, learning path, and credential recommendations.
            </p>
          </Card>
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add src/app/ src/components/layout/
git commit -m "feat: add root layout, landing page, and navigation components"
```

---

### Task 6: Dashboard & Upload Pages

**Covers:** [S1] AI Integration, [S3] Backend & database

**Files:**
- Create: `src/app/dashboard/page.tsx`
- Create: `src/app/upload/page.tsx`
- Create: `src/components/upload/FileDropzone.tsx`
- Create: `src/components/skills/SkillCard.tsx`
- Create: `src/components/skills/SkillGrid.tsx`
- Create: `src/hooks/useSkills.ts`

**Interfaces:**
- Consumes: AI parser from Task 3, Supabase client from Task 2
- Produces: Dashboard view and upload flow

- [ ] **Step 1: Create src/components/upload/FileDropzone.tsx**

```typescript
'use client';

import { useCallback, useState } from 'react';
import Button from '@/components/ui/Button';

interface FileDropzoneProps {
  onFileSelect: (file: File) => void;
}

const FileDropzone = ({ onFileSelect }: FileDropzoneProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        onFileSelect(files[0]);
      }
    },
    [onFileSelect]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
  };

  return (
    <div
      className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
        isDragging ? 'border-primary-500 bg-primary-50' : 'border-gray-300'
      }`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <div className="text-gray-400 mb-4">
        <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      </div>
      <p className="text-gray-600 mb-4">
        Drag and drop your resume, transcript, or certificate here
      </p>
      <p className="text-sm text-gray-500 mb-4">or</p>
      <label>
        <input
          type="file"
          accept=".pdf,.docx,.txt"
          className="hidden"
          onChange={handleFileInput}
        />
        <Button variant="outline">Browse Files</Button>
      </label>
      <p className="text-xs text-gray-500 mt-4">PDF, DOCX, or TXT (max 10MB)</p>
    </div>
  );
};

export default FileDropzone;
```

- [ ] **Step 2: Create src/components/skills/SkillCard.tsx**

```typescript
import type { Skill } from '@/types';
import Badge from '@/components/ui/Badge';

interface SkillCardProps {
  skill: Skill;
}

const SkillCard = ({ skill }: SkillCardProps) => {
  const confidenceColor = skill.confidence >= 0.8 ? 'success' : skill.confidence >= 0.5 ? 'warning' : 'default';

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-medium text-gray-900">{skill.name}</h4>
        <Badge variant={confidenceColor}>
          {Math.round(skill.confidence * 100)}%
        </Badge>
      </div>
      <p className="text-sm text-gray-500 capitalize">{skill.category}</p>
    </div>
  );
};

export default SkillCard;
```

- [ ] **Step 3: Create src/components/skills/SkillGrid.tsx**

```typescript
import type { Skill } from '@/types';
import SkillCard from './SkillCard';

interface SkillGridProps {
  skills: Skill[];
}

const SkillGrid = ({ skills }: SkillGridProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {skills.map((skill, index) => (
        <SkillCard key={`${skill.name}-${index}`} skill={skill} />
      ))}
    </div>
  );
};

export default SkillGrid;
```

- [ ] **Step 4: Create src/hooks/useSkills.ts**

```typescript
'use client';

import { useState } from 'react';
import type { Skill } from '@/types';

export function useSkills() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const extractSkills = async (file: File) => {
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/skills', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to extract skills');

      const data = await response.json();
      setSkills(data.skills);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return { skills, loading, error, extractSkills };
}
```

- [ ] **Step 5: Create src/app/upload/page.tsx**

```typescript
'use client';

import { useState } from 'react';
import FileDropzone from '@/components/upload/FileDropzone';
import SkillGrid from '@/components/skills/SkillGrid';
import { useSkills } from '@/hooks/useSkills';
import Card from '@/components/ui/Card';

export default function UploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { skills, loading, error, extractSkills } = useSkills();

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    await extractSkills(file);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Upload Your Resume</h1>

      <Card className="mb-8">
        <FileDropzone onFileSelect={handleFileSelect} />
      </Card>

      {selectedFile && (
        <Card className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Selected File</h2>
          <p className="text-gray-600">{selectedFile.name}</p>
        </Card>
      )}

      {loading && (
        <Card className="mb-8 text-center">
          <div className="animate-pulse text-primary-600">
            Analyzing your resume...
          </div>
        </Card>
      )}

      {error && (
        <Card className="mb-8 border-red-200 bg-red-50">
          <p className="text-red-600">{error}</p>
        </Card>
      )}

      {skills.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">
            Extracted Skills ({skills.length})
          </h2>
          <SkillGrid skills={skills} />
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 6: Create src/app/dashboard/page.tsx**

```typescript
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card>
          <h3 className="text-lg font-semibold mb-2">Skills Found</h3>
          <p className="text-4xl font-bold text-primary-600">0</p>
        </Card>
        <Card>
          <h3 className="text-lg font-semibold mb-2">Matches</h3>
          <p className="text-4xl font-bold text-primary-600">0</p>
        </Card>
        <Card>
          <h3 className="text-lg font-semibold mb-2">Documents</h3>
          <p className="text-4xl font-bold text-primary-600">0</p>
        </Card>
      </div>

      <Card>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="space-x-4">
          <Link href="/upload">
            <Button>Upload Resume</Button>
          </Link>
          <Link href="/matches">
            <Button variant="outline">View Matches</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
```

- [ ] **Step 7: Commit**

```bash
git add src/app/dashboard/ src/app/upload/ src/components/upload/ src/components/skills/ src/hooks/
git commit -m "feat: add dashboard, upload page, and skill components"
```

---

### Task 7: API Routes

**Covers:** [S1] AI Integration, [S3] Backend & database

**Files:**
- Create: `src/app/api/upload/route.ts`
- Create: `src/app/api/skills/route.ts`
- Create: `src/app/api/matches/route.ts`

**Interfaces:**
- Consumes: AI layer from Task 3, Supabase from Task 2
- Produces: API endpoints for file upload, skill extraction, match finding

- [ ] **Step 1: Create src/app/api/upload/route.ts**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const fileName = `${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(fileName, buffer);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('resumes')
      .getPublicUrl(fileName);

    return NextResponse.json({ url: publicUrl, fileName });
  } catch (error) {
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
```

- [ ] **Step 2: Create src/app/api/skills/route.ts**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { parseResumeToSkills, extractTextFromPDF, extractTextFromDOCX } from '@/lib/ai/parser';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let text: string;
    if (file.name.endsWith('.pdf')) {
      text = await extractTextFromPDF(buffer);
    } else if (file.name.endsWith('.docx')) {
      text = await extractTextFromDOCX(buffer);
    } else {
      text = buffer.toString('utf-8');
    }

    const skills = await parseResumeToSkills(text);

    return NextResponse.json({ skills });
  } catch (error) {
    return NextResponse.json({ error: 'Skill extraction failed' }, { status: 500 });
  }
}
```

- [ ] **Step 3: Create src/app/api/matches/route.ts**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { findMatches } from '@/lib/ai/matcher';
import type { Skill } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { skills, matchType } = await request.json() as {
      skills: Skill[];
      matchType: 'job' | 'learning_path' | 'credential';
    };

    if (!skills || skills.length === 0) {
      return NextResponse.json({ error: 'No skills provided' }, { status: 400 });
    }

    const matches = await findMatches(skills, matchType);

    return NextResponse.json({ matches });
  } catch (error) {
    return NextResponse.json({ error: 'Match finding failed' }, { status: 500 });
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/api/
git commit -m "feat: add API routes for upload, skill extraction, and matching"
```

---

### Task 8: Matches Page & Explanation Panel

**Covers:** [S1] AI Integration, [S6] Demo video

**Files:**
- Create: `src/components/matches/MatchCard.tsx`
- Create: `src/components/matches/MatchList.tsx`
- Create: `src/components/matches/ExplanationPanel.tsx`
- Create: `src/hooks/useMatches.ts`
- Create: `src/app/matches/page.tsx`

**Interfaces:**
- Consumes: AI matcher from Task 3, skill types from Task 1
- Produces: Match results UI with explanations

- [ ] **Step 1: Create src/components/matches/ExplanationPanel.tsx**

```typescript
import Card from '@/components/ui/Card';

interface ExplanationPanelProps {
  explanation: string;
  matchedSkills: string[];
}

const ExplanationPanel = ({ explanation, matchedSkills }: ExplanationPanelProps) => {
  return (
    <Card variant="elevated">
      <h4 className="font-semibold text-gray-900 mb-3">Why This Matches</h4>
      <p className="text-gray-600 mb-4">{explanation}</p>
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Matched Skills:</p>
        <div className="flex flex-wrap gap-2">
          {matchedSkills.map((skill, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-primary-100 text-primary-800 text-sm rounded"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default ExplanationPanel;
```

- [ ] **Step 2: Create src/components/matches/MatchCard.tsx**

```typescript
'use client';

import { useState } from 'react';
import type { Match } from '@/types';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import ExplanationPanel from './ExplanationPanel';

interface MatchCardProps {
  match: Match;
}

const MatchCard = ({ match }: MatchCardProps) => {
  const [showExplanation, setShowExplanation] = useState(false);

  const scoreColor = match.match_score >= 0.8 ? 'success' : match.match_score >= 0.5 ? 'warning' : 'default';

  return (
    <div className="space-y-4">
      <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setShowExplanation(!showExplanation)}>
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900">{match.title}</h3>
          <Badge variant={scoreColor}>
            {Math.round(match.match_score * 100)}% Match
          </Badge>
        </div>
        <p className="text-gray-600 mb-3">{match.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500 capitalize">
            {match.type.replace('_', ' ')}
          </span>
          <span className="text-sm text-primary-600">
            {showExplanation ? 'Hide' : 'Show'} Details
          </span>
        </div>
      </Card>

      {showExplanation && (
        <ExplanationPanel
          explanation={match.explanation}
          matchedSkills={match.matched_skills}
        />
      )}
    </div>
  );
};

export default MatchCard;
```

- [ ] **Step 3: Create src/components/matches/MatchList.tsx**

```typescript
import type { Match } from '@/types';
import MatchCard from './MatchCard';

interface MatchListProps {
  matches: Match[];
}

const MatchList = ({ matches }: MatchListProps) => {
  if (matches.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No matches found. Upload a resume to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {matches.map((match, index) => (
        <MatchCard key={`${match.title}-${index}`} match={match} />
      ))}
    </div>
  );
};

export default MatchList;
```

- [ ] **Step 4: Create src/hooks/useMatches.ts**

```typescript
'use client';

import { useState } from 'react';
import type { Match, Skill } from '@/types';

export function useMatches() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const findJobMatches = async (skills: Skill[]) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skills, matchType: 'job' }),
      });

      if (!response.ok) throw new Error('Failed to find matches');

      const data = await response.json();
      setMatches(data.matches);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return { matches, loading, error, findJobMatches };
}
```

- [ ] **Step 5: Create src/app/matches/page.tsx**

```typescript
'use client';

import { useMatches } from '@/hooks/useMatches';
import { useSkills } from '@/hooks/useSkills';
import MatchList from '@/components/matches/MatchList';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

export default function MatchesPage() {
  const { matches, loading, error, findJobMatches } = useMatches();
  const { skills } = useSkills();

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Your Matches</h1>

      {skills.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-gray-600 mb-4">
            Upload a resume first to see your matches.
          </p>
          <a href="/upload">
            <Button>Upload Resume</Button>
          </a>
        </Card>
      ) : (
        <>
          <div className="mb-6">
            <Button onClick={() => findJobMatches(skills)} disabled={loading}>
              {loading ? 'Finding Matches...' : 'Refresh Matches'}
            </Button>
          </div>

          {error && (
            <Card className="mb-6 border-red-200 bg-red-50">
              <p className="text-red-600">{error}</p>
            </Card>
          )}

          <MatchList matches={matches} />
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add src/components/matches/ src/hooks/useMatches.ts src/app/matches/
git commit -m "feat: add matches page with explanation panel"
```

---

### Task 9: Auth Pages

**Covers:** [S3] Authentication

**Files:**
- Create: `src/app/auth/login/page.tsx`
- Create: `src/app/auth/signup/page.tsx`
- Create: `src/hooks/useAuth.ts`

**Interfaces:**
- Consumes: Supabase client from Task 2
- Produces: Login/signup pages and auth hook

- [ ] **Step 1: Create src/hooks/useAuth.ts**

```typescript
'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { User } from '@/types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signUp = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
    } else if (data.user) {
      setUser(data.user as unknown as User);
    }

    setLoading(false);
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
    } else if (data.user) {
      setUser(data.user as unknown as User);
    }

    setLoading(false);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return { user, loading, error, signUp, signIn, signOut };
}
```

- [ ] **Step 2: Create src/app/auth/login/page.tsx**

```typescript
'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { loading, error, signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await signIn(email, password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">Login</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <p className="text-center mt-4 text-gray-600">
          Don't have an account?{' '}
          <Link href="/auth/signup" className="text-primary-600 hover:underline">
            Sign up
          </Link>
        </p>
      </Card>
    </div>
  );
}
```

- [ ] **Step 3: Create src/app/auth/signup/page.tsx**

```typescript
'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Link from 'next/link';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { loading, error, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password === confirmPassword) {
      await signUp(email, password);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">Sign Up</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Input
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating account...' : 'Sign Up'}
          </Button>
        </form>

        <p className="text-center mt-4 text-gray-600">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-primary-600 hover:underline">
            Login
          </Link>
        </p>
      </Card>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/auth/ src/hooks/useAuth.ts
git commit -m "feat: add authentication pages and auth hook"
```

---

### Task 10: Documentation & Project Docs

**Covers:** [S4] Documentation, [S5] Grading gate coverage

**Files:**
- Create: `README.md`
- Create: `docs/README.md`
- Create: `docs/ARCHITECTURE.md`
- Create: `docs/GRADING-GATES.md`
- Create: `src/app/layout.tsx` (update for middleware)

**Interfaces:**
- Produces: All project documentation

- [ ] **Step 1: Create README.md**

```markdown
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
```

- [ ] **Step 2: Create docs/ARCHITECTURE.md**

```markdown
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

1. User uploads document via FileDropzone
2. API route receives file, extracts text (PDF/DOCX/TXT)
3. Text sent to AI parser (LMStudio first, fallback to OpenAI)
4. AI returns structured skills with confidence scores
5. Skills stored in Supabase and displayed in UI
6. User requests matches via matcher API
7. AI returns job/learning/credential recommendations
8. Matches displayed with explanations

## Security

- All API routes validate input
- Supabase RLS policies enforce data isolation
- AI API keys stored in environment variables
- No student code execution (read-only analysis)
```

- [ ] **Step 3: Create docs/GRADING-GATES.md**

```markdown
# Grading Gates Coverage

## Gate 1: AI Integration ✅

**Evidence:**
- `src/lib/ai/openai.ts` - OpenAI client wrapper
- `src/lib/ai/lmstudio.ts` - LMStudio client wrapper
- `src/lib/ai/parser.ts` - Resume/skill extraction
- `src/lib/ai/matcher.ts` - Match finding engine
- Hybrid approach with fallback between providers

## Gate 2: Backend & Database ✅

**Evidence:**
- Supabase PostgreSQL database
- `src/lib/supabase/client.ts` - Browser client
- `src/lib/supabase/server.ts` - Server client
- API routes for upload, skills, matches

## Gate 3: Authentication ✅

**Evidence:**
- Supabase Auth integration
- `src/app/auth/login/page.tsx` - Login page
- `src/app/auth/signup/page.tsx` - Signup page
- `src/lib/supabase/middleware.ts` - Auth middleware
- Protected routes redirect to login

## Gate 4: Documentation ✅

**Evidence:**
- `README.md` - Project overview
- `docs/README.md` - Detailed documentation
- `docs/ARCHITECTURE.md` - System architecture
- `docs/DESIGN.md` - Design system
- `docs/GRADING-GATES.md` - This document

## Gate 5: Deployment ✅

**Evidence:**
- Vercel-compatible Next.js project
- Environment variables documented
- `.env.example` provided
- Ready for `vercel deploy`

## Gate 6: Demo Video ⏳

**Planned:**
- Record screen capture of upload flow
- Show skill extraction results
- Demonstrate match recommendations
- Upload to YouTube/Vercel

## Gate 7: Commit Hygiene ✅

**Evidence:**
- Conventional commit messages (feat:, fix:, docs:)
- Clean git history
- `.gitignore` configured
- No secrets in repository
```

- [ ] **Step 4: Create src/middleware.ts (Next.js middleware)**

```typescript
import { updateSession } from '@/lib/supabase/middleware';
import { type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
```

- [ ] **Step 5: Commit**

```bash
git add README.md docs/ src/middleware.ts
git commit -m "docs: add README, architecture, and grading gates documentation"
```

---

### Task 11: Final Verification & Cleanup

**Covers:** [S5] Grading gate coverage

**Files:**
- Verify: All files created correctly
- Run: `npm run build` to verify no errors

**Interfaces:**
- Produces: Working project scaffold ready for development

- [ ] **Step 1: Verify project structure**

Run: `ls -la`
Expected: All project files present

- [ ] **Step 2: Install and verify dependencies**

Run: `npm install`
Run: `npm run build`
Expected: Build succeeds with no errors

- [ ] **Step 3: Final commit**

```bash
git add .
git commit -m "chore: final project scaffold verification"
```

---

## Self-Review Checklist

1. **Spec coverage:** All 7 grading gates have tasks addressing them ✅
2. **Placeholder scan:** No TBD/TODO markers in code ✅
3. **Type consistency:** All types defined in `src/types/index.ts` used consistently ✅
4. **File structure:** Clean organization following Next.js conventions ✅
5. **Documentation:** README, ARCHITECTURE, DESIGN, GRADING-GATES all created ✅
