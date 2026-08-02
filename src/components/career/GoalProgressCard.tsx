'use client';

import type { GoalProgress } from '@/types';
import Badge from '@/components/ui/Badge';

function ProgressBar({ label, value, max }: { label: string; value: number; max?: number }) {
  const pct = max ? Math.min(100, Math.round((value / max) * 100)) : Math.min(100, value);
  return (
    <div>
      <div className="mb-0.5 flex items-center justify-between text-xs">
        <span className="text-slate-600">{label}</span>
        <span className="font-medium text-slate-900">
          {value}{max ? `/${max}` : ''}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-primary-600" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function GoalProgressCard({ progress }: { progress: GoalProgress }) {
  const since = progress.baseline.captured_at ? new Date(progress.baseline.captured_at).toLocaleDateString() : '';
  const delta = progress.match_score_change;
  const portfolioDelta = progress.portfolio_score_now - progress.baseline.portfolio_score;

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <h3 className="text-base font-semibold text-slate-900">{progress.role_title}</h3>
        <Badge variant="success">Active goal</Badge>
        {since && <span className="text-xs text-slate-400">since {since}</span>}
      </div>

      <div className="mb-3 grid gap-2 sm:grid-cols-3">
        <div className="rounded-lg bg-primary-50 p-3">
          <p className="text-xs text-primary-700">Coverage now</p>
          <p className="text-2xl font-bold text-primary-900">{progress.coverage}%</p>
        </div>
        <div className="rounded-lg bg-emerald-50 p-3">
          <p className="text-xs text-emerald-700">Match change</p>
          <p className={`text-2xl font-bold ${delta >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
            {delta >= 0 ? '+' : ''}{delta}%
          </p>
        </div>
        <div className="rounded-lg bg-violet-50 p-3">
          <p className="text-xs text-violet-700">Portfolio score</p>
          <p className="text-2xl font-bold text-violet-900">
            {progress.portfolio_score_now}
            <span className={`ml-1 text-sm font-semibold ${portfolioDelta >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
              ({portfolioDelta >= 0 ? '+' : ''}{portfolioDelta})
            </span>
          </p>
        </div>
      </div>

      <div className="space-y-2.5">
        <ProgressBar label="Required skills covered" value={progress.coverage} />
        <ProgressBar label="Skills acquired" value={progress.skills_acquired.length} />
        <ProgressBar label="Goal-specific skills" value={progress.goal_skills_acquired.length} />
        <ProgressBar
          label="Courses completed"
          value={progress.courses_completed.length}
        />
        <ProgressBar
          label="Roadmap phases"
          value={progress.roadmap_phases_completed}
          max={progress.roadmap_total_phases}
        />
      </div>

      {progress.goal_skills_acquired.length > 0 && (
        <div className="mt-3">
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">New goal skills</p>
          <div className="flex flex-wrap gap-1.5">
            {progress.goal_skills_acquired.map((skill) => (
              <Badge key={skill} variant="success">{skill}</Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
