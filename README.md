# Skills Pathfinder

**Connecting Talent to Opportunity** | An FAU AI HootCamp Summer 2026 Project

Skills Pathfinder is an AI-powered web application that helps students and professionals understand their capabilities and discover relevant career opportunities. By parsing resumes, transcripts, and certificates, it provides clear, actionable recommendations for jobs, learning paths, and credentials.

## Features

-   **Intelligent Document Parsing**: Upload PDF, DOCX, or plain text files and let the AI extract your skills with confidence scores.
-   **Interactive Skill Dashboard**: View, edit, and manage your skills in a clean, user-friendly interface.
-   **Explainable Recommendations**: Get AI-powered suggestions for jobs, courses, and certifications that match your profile. Each recommendation explains *why* it's a fit and what skills you're missing.
-   **Secure User Accounts**: Your data is protected with secure authentication and session management powered by Supabase.

## Tech Stack

-   **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL, Auth, Storage)
-   **AI Providers**: [OpenAI GPT-4o](https://openai.com/) (production) & [LM Studio](https://lmstudio.ai/) (local development)

## Getting Started

### Prerequisites

-   Node.js v18+
-   npm or yarn
-   A Supabase project
-   An OpenAI API key

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/skills-pathfinder.git
    cd skills-pathfinder
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Copy the example file and fill in your Supabase and OpenAI credentials.
    ```bash
    cp .env.example .env
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:3000`.

### Validation

Use `npm run check` or `npm test` to run the production build as the project smoke check. This validates routing, TypeScript, and page generation in one command.

Last verified successfully on 2026-07-21 with a clean production build and browser smoke tests.

## Documentation

For detailed technical information, please see the [**full documentation**](./docs/README.md).

| Document                               | Purpose                                          |
| -------------------------------------- | ------------------------------------------------ |
| [Architecture](./docs/ARCHITECTURE.md) | System architecture and data flow diagram.       |
| [Database](./docs/DATABASE.md)         | Schema definitions and relationships.            |
| [API](./docs/API.md)                   | Endpoint specifications.                         |
| [AI Design](./docs/AI-DESIGN.md)       | Hybrid AI strategy and prompting.                |
| [Security](./docs/SECURITY.md)         | Security measures and policies.                  |
| [Deployment](./docs/DEPLOYMENT.md)     | Guide for deploying to Vercel.                   |

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.
