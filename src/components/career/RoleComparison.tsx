'use client';

import type { RoleComparison } from '@/types';
import Badge from '@/components/ui/Badge';

function ScoreBadge({ score }: { score: number }) {
  const variant = score >= 70 ? 'success' : score >= 40 ? 'warning' : 'default';
  return <Badge variant={variant}>{score}%</Badge>;
}

export default function RoleComparisonView({ comparisons }: { comparisons: RoleComparison[] }) {
  if (comparisons.length === 0) {
    return <p className="py-4 text-center text-sm text-slate-400">Select 2-3 roles and compare.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <thead>
          <tr>
            <th className="border-b border-slate-200 px-3 py-2 text-left font-semibold text-slate-500">Metric</th>
            {comparisons.map((c) => (
              <th key={c.role.title} className="border-b border-slate-200 px-3 py-2 text-left font-semibold text-slate-900">
                <div className="flex items-center gap-2">
                  {c.role.title}
                  {c.cached && <Badge variant="default">saved</Badge>}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="px-3 py-2 font-medium text-slate-600">Match</td>
            {comparisons.map((c) => (
              <td key={c.role.title} className="px-3 py-2">
                <ScoreBadge score={c.gap.match_score} />
              </td>
            ))}
          </tr>
          <tr className="bg-slate-50/50">
            <td className="px-3 py-2 font-medium text-slate-600">Coverage</td>
            {comparisons.map((c) => (
              <td key={c.role.title} className="px-3 py-2 text-slate-900">{c.gap.coverage}%</td>
            ))}
          </tr>
          <tr>
            <td className="px-3 py-2 font-medium text-slate-600">Salary</td>
            {comparisons.map((c) => (
              <td key={c.role.title} className="px-3 py-2 text-slate-900">{c.role.salary_range || '—'}</td>
            ))}
          </tr>
          <tr className="bg-slate-50/50">
            <td className="px-3 py-2 font-medium text-slate-600">Demand</td>
            {comparisons.map((c) => (
              <td key={c.role.title} className="px-3 py-2">
                {c.role.demand_level ? (
                  <Badge variant={c.role.demand_level === 'high' ? 'success' : c.role.demand_level === 'medium' ? 'info' : 'default'}>
                    {c.role.demand_level}
                  </Badge>
                ) : '—'}
              </td>
            ))}
          </tr>
          <tr>
            <td className="px-3 py-2 font-medium text-slate-600">Entry level</td>
            {comparisons.map((c) => (
              <td key={c.role.title} className="px-3 py-2 text-slate-900">{c.role.entry_difficulty || '—'}</td>
            ))}
          </tr>
          <tr className="bg-slate-50/50 align-top">
            <td className="px-3 py-2 font-medium text-slate-600">Missing skills</td>
            {comparisons.map((c) => (
              <td key={c.role.title} className="px-3 py-2">
                <div className="flex flex-wrap gap-1">
                  {c.gap.missing_skills.slice(0, 5).map((s) => (
                    <Badge key={s} variant="warning">{s}</Badge>
                  ))}
                  {c.gap.missing_skills.length > 5 && (
                    <span className="text-xs text-slate-400">+{c.gap.missing_skills.length - 5} more</span>
                  )}
                  {c.gap.missing_skills.length === 0 && <span className="text-xs text-emerald-600">Nothing missing</span>}
                </div>
              </td>
            ))}
          </tr>
          <tr className="align-top">
            <td className="px-3 py-2 font-medium text-slate-600">Top courses</td>
            {comparisons.map((c) => (
              <td key={c.role.title} className="px-3 py-2">
                <ul className="space-y-1">
                  {c.courses.slice(0, 3).map((course) => (
                    <li key={course.id} className="text-slate-700">
                      <span className="font-medium text-slate-900">{course.title}</span>{' '}
                      <span className="text-xs text-slate-400">{course.platform}</span>
                    </li>
                  ))}
                  {c.courses.length === 0 && <li className="text-xs text-slate-400">No matching courses</li>}
                </ul>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
