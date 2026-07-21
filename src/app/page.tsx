import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

export default function Home() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-8">
        <div className="max-w-2xl">
          <h1 className="text-5xl font-semibold tracking-tight text-slate-900 sm:text-6xl">
            Turn documents into a clear next move.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
            Upload your resume, transcript, or certificate and get structured skill extraction, credible match recommendations, and a clean workspace to review everything in one place.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/auth/signup">
              <Button size="lg">Create account</Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" size="lg">Open dashboard</Button>
            </Link>
          </div>
        </div>

        <Card className="overflow-hidden p-0">
          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="text-lg font-semibold text-slate-900">How the workspace flows</h2>
            <p className="mt-1 text-sm text-slate-600">A simple three-step process with no decorative noise.</p>
          </div>
          <div className="divide-y divide-slate-200">
            <div className="flex gap-4 px-6 py-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-900">1</div>
              <div>
                <h3 className="text-base font-semibold text-slate-900">Upload your document</h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">Start with a PDF, DOCX, or TXT file and let the app extract the useful parts.</p>
              </div>
            </div>
            <div className="flex gap-4 px-6 py-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-900">2</div>
              <div>
                <h3 className="text-base font-semibold text-slate-900">Review the extracted skills</h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">Edit, add, or remove skills so the profile reflects the person, not only the parser.</p>
              </div>
            </div>
            <div className="flex gap-4 px-6 py-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-900">3</div>
              <div>
                <h3 className="text-base font-semibold text-slate-900">Generate matches</h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">See roles, learning paths, and credentials with a clear explanation for each match.</p>
              </div>
            </div>
          </div>
        </Card>
      </section>

      <section className="mt-16 grid gap-6 md:grid-cols-3">
        <Card>
          <h3 className="text-lg font-semibold text-slate-900">Professional profiles</h3>
          <p className="mt-3 text-sm leading-6 text-slate-600">Keep the user&apos;s name and email visible in the header after sign-in for a cleaner identity handoff.</p>
        </Card>
        <Card>
          <h3 className="text-lg font-semibold text-slate-900">Consistent surfaces</h3>
          <p className="mt-3 text-sm leading-6 text-slate-600">Shared controls, restrained color, and one visual system across dashboard, upload, and matches.</p>
        </Card>
        <Card>
          <h3 className="text-lg font-semibold text-slate-900">Fast review loop</h3>
          <p className="mt-3 text-sm leading-6 text-slate-600">Edit skills, refresh matches, and move between views without losing context.</p>
        </Card>
      </section>
    </div>
  );
}
