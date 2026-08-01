'use client';

import type { Roadmap } from '@/types';
import Badge from '@/components/ui/Badge';

export default function RoadmapTimeline({ roadmap }: { roadmap: Roadmap }) {
  if (!roadmap.phases || roadmap.phases.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-slate-500">
        No roadmap phases generated yet.
      </p>
    );
  }

  return (
    <ol className="relative space-y-8 before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
      {roadmap.phases.map((phase) => (
        <li key={phase.phase} className="relative pl-12">
          <span className="absolute left-0 top-1 flex h-9 w-9 items-center justify-center rounded-full bg-primary-600 text-sm font-semibold text-white shadow-soft">
            {phase.phase}
          </span>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="info">Phase {phase.phase}</Badge>
              <Badge variant="default">{phase.months}</Badge>
              <h4 className="text-base font-semibold text-slate-900">{phase.title}</h4>
            </div>

            {phase.summary && (
              <p className="mt-2 text-sm leading-6 text-slate-600">{phase.summary}</p>
            )}

            {phase.skills_to_build.length > 0 && (
              <div className="mt-3">
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Skills to build
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {phase.skills_to_build.map((skill) => (
                    <Badge key={skill} variant="warning">{skill}</Badge>
                  ))}
                </div>
              </div>
            )}

            {phase.milestones.length > 0 && (
              <div className="mt-3">
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Milestones
                </p>
                <ul className="space-y-1">
                  {phase.milestones.map((milestone) => (
                    <li key={milestone} className="flex gap-2 text-sm text-slate-600">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-slate-400" />
                      <span>{milestone}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {phase.courses.length > 0 && (
              <div className="mt-3">
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Recommended courses
                </p>
                <ul className="space-y-1.5">
                  {phase.courses.map((course) => (
                    <li key={course.title} className="flex items-center gap-2 text-sm">
                      <span className="text-slate-600">{course.title}</span>
                      {course.platform && (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                          {course.platform}
                        </span>
                      )}
                      {course.cost && (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                          {course.cost}
                        </span>
                      )}
                      {course.url ? (
                        <a
                          href={course.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-blue-600 hover:text-blue-700 hover:underline"
                        >
                          View →
                        </a>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
