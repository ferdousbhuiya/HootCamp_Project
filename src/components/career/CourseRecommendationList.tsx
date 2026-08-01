'use client';

import type { CourseRecommendation } from '@/types';
import Badge from '@/components/ui/Badge';

interface CourseRecommendationListProps {
  recommendations: CourseRecommendation[];
  loading: boolean;
  catalogEmpty: boolean;
}

export default function CourseRecommendationList({
  recommendations,
  loading,
  catalogEmpty,
}: CourseRecommendationListProps) {
  if (catalogEmpty) {
    return (
      <p className="py-4 text-sm text-slate-500">
        Course catalog not seeded yet. Run migration <code className="rounded bg-slate-100 px-1">008_career_features.sql</code> in Supabase.
      </p>
    );
  }

  if (loading) {
    return (
      <div className="space-y-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-16 animate-pulse rounded-lg bg-slate-100" />
        ))}
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <p className="py-4 text-sm text-slate-500">
        No courses found that cover your missing skills yet.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {recommendations.map((course) => (
        <div key={course.id} className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-slate-900">{course.title}</p>
              {course.platform && <Badge variant="info">{course.platform}</Badge>}
              {course.level && (
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                  {course.level}
                </span>
              )}
            </div>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {course.covered_skills.map((skill) => (
                <Badge key={skill} variant="success">{skill}</Badge>
              ))}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            {course.cost && <span className="text-xs font-medium text-slate-600">{course.cost}</span>}
            {course.url ? (
              <a
                href={course.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
              >
                View course →
              </a>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
