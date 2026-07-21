import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

export default function Home() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-10">
        <div className="max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">Skills Pathfinder</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl lg:text-[3.75rem] lg:leading-[1.02]">
            A cleaner way to move from document to direction.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
            Upload a resume, transcript, or certificate and get a workspace that feels calm, practical, and designed for decision making.
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
            <p className="text-sm font-medium text-slate-500">How it works</p>
            <h2 className="mt-1 text-xl font-semibold text-slate-900">Three focused steps</h2>
          </div>
          <div className="divide-y divide-slate-200">
            <div className="flex gap-4 px-6 py-5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-900">1</div>
              <div>
                <h3 className="text-base font-semibold text-slate-900">Upload your file</h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">Start with a PDF, DOCX, or TXT file and extract the useful parts quickly.</p>
              </div>
            </div>
            <div className="flex gap-4 px-6 py-5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-900">2</div>
              <div>
                <h3 className="text-base font-semibold text-slate-900">Refine the skills</h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">Adjust the extracted list so it matches the person, not just the parser.</p>
              </div>
            </div>
            <div className="flex gap-4 px-6 py-5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-900">3</div>
              <div>
                <h3 className="text-base font-semibold text-slate-900">Review matches</h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">See practical recommendations with clear reasons and next steps.</p>
              </div>
            </div>
          </div>
        </Card>
      </section>

      <section className="mt-14 grid gap-6 md:grid-cols-3">
        <Card>
          <h3 className="text-lg font-semibold text-slate-900">Professional identity</h3>
          <p className="mt-3 text-sm leading-6 text-slate-600">After sign-in, the header should show name and email instead of auth links.</p>
        </Card>
        <Card>
          <h3 className="text-lg font-semibold text-slate-900">Quiet color system</h3>
          <p className="mt-3 text-sm leading-6 text-slate-600">Use restrained neutrals and one strong action color, not a busy gradient palette.</p>
        </Card>
        <Card>
          <h3 className="text-lg font-semibold text-slate-900">Task-first layout</h3>
          <p className="mt-3 text-sm leading-6 text-slate-600">The UI should disappear into the workflow and keep the focus on the user's next move.</p>
        </Card>
      </section>
    </div>
  );
}
