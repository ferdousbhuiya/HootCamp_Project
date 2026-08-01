'use client';

import type { Skill } from '@/types';

const CATEGORY_COLORS: Record<string, string> = {
  technical: 'bg-primary-500',
  soft: 'bg-emerald-500',
  domain: 'bg-amber-500',
  tool: 'bg-violet-500',
  other: 'bg-slate-400',
};

const CATEGORY_LABELS: Record<string, string> = {
  technical: 'Technical',
  soft: 'Soft skills',
  domain: 'Domain knowledge',
  tool: 'Tools',
  other: 'Other',
};

export default function SkillDistributionChart({ skills }: { skills: Skill[] }) {
  const counts = skills.reduce<Record<string, number>>((acc, skill) => {
    const category = (skill.category || 'other').toLowerCase();
    const key = CATEGORY_LABELS[category] ? category : 'other';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const total = skills.length;
  if (total === 0) {
    return <p className="text-sm text-slate-400">No skills yet to chart.</p>;
  }

  const order = ['technical', 'soft', 'domain', 'tool', 'other'];

  return (
    <div className="space-y-3">
      {order
        .filter((cat) => (counts[cat] || 0) > 0)
        .map((cat) => {
          const count = counts[cat] || 0;
          const pct = Math.round((count / total) * 100);
          return (
            <div key={cat}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="text-slate-600">{CATEGORY_LABELS[cat]}</span>
                <span className="font-medium text-slate-900">
                  {count} <span className="text-xs text-slate-400">({pct}%)</span>
                </span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full ${CATEGORY_COLORS[cat]}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
    </div>
  );
}
