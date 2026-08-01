'use client';

import type { PortfolioScore } from '@/lib/portfolioScore';

interface PortfolioScoreCardProps {
  score: PortfolioScore;
}

const BREAKDOWN_LABELS: { key: keyof typeof BREAKDOWN_MAXES; label: string }[] = [
  { key: 'skills', label: 'Skill depth' },
  { key: 'breadth', label: 'Category breadth' },
  { key: 'verification', label: 'Verified skills' },
  { key: 'certificates', label: 'Certificates' },
  { key: 'courses', label: 'Course progress' },
];

const BREAKDOWN_MAXES = {
  skills: 40,
  breadth: 10,
  verification: 20,
  certificates: 20,
  courses: 10,
} as const;

function ScoreRing({ value }: { value: number }) {
  const size = 140;
  const stroke = 12;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = (circumference * value) / 100;
  const color = value >= 70 ? '#16a34a' : value >= 40 ? '#d97706' : '#dc2626';

  return (
    <div className="relative h-[140px] w-[140px] shrink-0">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e2e8f0" strokeWidth={stroke} />
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
        <span className="text-4xl font-bold text-slate-900">{value}</span>
        <span className="text-xs text-slate-500">of 100</span>
      </div>
    </div>
  );
}

export default function PortfolioScoreCard({ score }: PortfolioScoreCardProps) {
  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
      <ScoreRing value={score.score} />

      <div className="flex-1 space-y-2">
        {BREAKDOWN_LABELS.map(({ key, label }) => {
          const value = score.breakdown[key];
          const max = BREAKDOWN_MAXES[key];
          const pct = max > 0 ? Math.round((value / max) * 100) : 0;
          return (
            <div key={key}>
              <div className="mb-0.5 flex items-center justify-between text-xs">
                <span className="text-slate-600">{label}</span>
                <span className="font-medium text-slate-900">{value}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-primary-600"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
