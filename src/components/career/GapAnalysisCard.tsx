'use client';

import type { GapAnalysis, JobRole } from '@/types';
import Badge from '@/components/ui/Badge';

interface GapAnalysisCardProps {
  role: JobRole;
  analysis: GapAnalysis;
  persisted: boolean;
}

function ScoreRing({ score }: { score: number }) {
  const size = 120;
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = (circumference * score) / 100;
  const color = score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#f43f5e';

  return (
    <div className="relative h-[120px] w-[120px]">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference - dash}`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-slate-900">{score}%</span>
        <span className="text-xs text-slate-500">match</span>
      </div>
    </div>
  );
}

export default function GapAnalysisCard({ role, analysis, persisted }: GapAnalysisCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
        <ScoreRing score={analysis.match_score} />

        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-xl font-semibold text-slate-900">{role.title}</h3>
            {!persisted && (
              <Badge variant="warning">Not saved — add a portfolio refresh to persist</Badge>
            )}
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-3">
            <span className="text-sm text-slate-600">
              Coverage: <strong className="text-slate-900">{analysis.coverage}%</strong> of required skills
            </span>
            {role.salary_range && (
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                {role.salary_range}
              </span>
            )}
            {role.demand_level && (
              <Badge variant={role.demand_level === 'high' ? 'success' : role.demand_level === 'medium' ? 'info' : 'default'}>
                {role.demand_level} demand
              </Badge>
            )}
            {role.entry_difficulty && (
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                {role.entry_difficulty} level
              </span>
            )}
          </div>

          {analysis.summary && (
            <p className="mt-3 text-sm leading-6 text-slate-600">{analysis.summary}</p>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div>
          <h4 className="mb-2 text-sm font-semibold text-green-700">You Have</h4>
          <div className="flex flex-wrap gap-1.5">
            {analysis.have_skills.length > 0 ? (
              analysis.have_skills.map((skill) => (
                <Badge key={skill} variant="success">{skill}</Badge>
              ))
            ) : (
              <p className="text-sm text-slate-400">No matching skills yet</p>
            )}
          </div>
        </div>

        <div>
          <h4 className="mb-2 text-sm font-semibold text-yellow-700">Skills to Build</h4>
          <div className="flex flex-wrap gap-1.5">
            {analysis.missing_skills.length > 0 ? (
              analysis.missing_skills.map((skill) => (
                <Badge key={skill} variant="warning">{skill}</Badge>
              ))
            ) : (
              <p className="text-sm text-slate-400">You have everything this role needs</p>
            )}
          </div>
        </div>
      </div>

      {analysis.recommendations.length > 0 && (
        <div className="mt-6">
          <h4 className="mb-2 text-sm font-semibold text-slate-900">Recommended Next Steps</h4>
          <ol className="space-y-1.5">
            {analysis.recommendations.map((rec, i) => (
              <li key={i} className="flex gap-2 text-sm text-slate-600">
                <span className="font-semibold text-slate-400">{i + 1}.</span>
                <span>{rec}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
