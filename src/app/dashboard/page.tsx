'use client';

import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { useSkills } from '@/hooks/useSkills';
import { useMatches } from '@/hooks/useMatches';

export default function DashboardPage() {
  const { skills } = useSkills();
  const { matches } = useMatches();

  // For now, we'll count a single set of skills as one "document"
  // This can be improved later
  const documentCount = skills.length > 0 ? 1 : 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10 max-w-3xl">
        <h1 className="text-4xl font-semibold tracking-tight text-slate-900">Dashboard</h1>
        <p className="mt-3 text-lg leading-8 text-slate-600">A quiet overview of your extracted skills, saved documents, and next actions.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <p className="text-sm font-medium text-slate-500">Skills found</p>
            <p className="mt-3 text-4xl font-semibold text-slate-900">{skills.length}</p>
          </Card>
          <Card>
            <p className="text-sm font-medium text-slate-500">Matches</p>
            <p className="mt-3 text-4xl font-semibold text-slate-900">{matches.length}</p>
          </Card>
          <Card>
            <p className="text-sm font-medium text-slate-500">Documents</p>
            <p className="mt-3 text-4xl font-semibold text-slate-900">{documentCount}</p>
          </Card>
        </div>

        <Card>
          <h2 className="text-xl font-semibold text-slate-900">Quick actions</h2>
          <p className="mt-2 text-sm text-slate-600">Jump to the next step without hunting through menus.</p>
          <div className="mt-6 space-y-3">
            <Link href="/upload" className="block">
              <Button className="w-full">Upload resume</Button>
            </Link>
            <Link href="/matches" className="block">
              <Button variant="outline" className="w-full">View matches</Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
