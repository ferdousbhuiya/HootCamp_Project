import type { Course, CourseRecommendation } from '@/types';

/**
 * Deterministic course recommendation.
 * Scores each course by how many of the missing skills its syllabus covers.
 * No LLM — grounding in the curated catalog prevents hallucinated course URLs.
 */
export function recommendCourses(
  catalog: Course[],
  missingSkills: string[],
  limit = 6
): CourseRecommendation[] {
  const missing = missingSkills.map((s) => s.trim().toLowerCase()).filter(Boolean);
  if (missing.length === 0 || catalog.length === 0) return [];

  const scored = catalog.map((course) => {
    const courseSkills = (course.skills || []).map((s) => s.trim().toLowerCase());
    const covered = missing.filter((m) => courseSkills.some((cs) => cs.includes(m) || m.includes(cs)));
    return { course, covered };
  });

  return scored
    .filter(({ covered }) => covered.length > 0)
    .sort((a, b) => {
      if (b.covered.length !== a.covered.length) return b.covered.length - a.covered.length;
      return a.course.title.localeCompare(b.course.title);
    })
    .slice(0, Math.max(1, Math.min(limit, 12)))
    .map(({ course, covered }) => ({
      ...course,
      covered_skills: Array.from(new Set(covered)),
    }));
}
