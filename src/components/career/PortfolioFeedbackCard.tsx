'use client';

import type { PortfolioFeedback } from '@/types';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

interface PortfolioFeedbackCardProps {
  feedback: PortfolioFeedback | null;
  loading: boolean;
  error: string | null;
  onGetFeedback: () => void;
}

export default function PortfolioFeedbackCard({
  feedback,
  loading,
  error,
  onGetFeedback,
}: PortfolioFeedbackCardProps) {
  return (
    <div>
      <div className="mb-4">
        <Button onClick={onGetFeedback} disabled={loading}>
          {loading ? 'Analyzing your portfolio...' : feedback ? 'Refresh AI Feedback' : 'Get AI Portfolio Feedback'}
        </Button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading && (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-14 animate-pulse rounded-lg bg-slate-100" />
          ))}
        </div>
      )}

      {feedback && !loading && (
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <h4 className="mb-2 text-sm font-semibold text-emerald-700">Strengths</h4>
            <div className="flex flex-wrap gap-1.5">
              {feedback.strengths.map((s) => (
                <Badge key={s} variant="success">{s}</Badge>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-2 text-sm font-semibold text-amber-700">Weaknesses</h4>
            <div className="flex flex-wrap gap-1.5">
              {feedback.weaknesses.map((s) => (
                <Badge key={s} variant="warning">{s}</Badge>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-2 text-sm font-semibold text-primary-700">Keywords employers look for</h4>
            <div className="flex flex-wrap gap-1.5">
              {feedback.missing_keywords.map((k) => (
                <Badge key={k} variant="info">{k}</Badge>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-2 text-sm font-semibold text-slate-900">Suggested next steps</h4>
            <ol className="space-y-1.5">
              {feedback.suggestions.map((s, i) => (
                <li key={i} className="text-sm text-slate-600">
                  <span className="font-semibold text-slate-800">{s.title}.</span>{' '}
                  {s.description}
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}
