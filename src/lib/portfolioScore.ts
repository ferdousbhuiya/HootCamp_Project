import type { Skill, Certificate, OngoingCourse } from '@/types';

export interface PortfolioBreakdown {
  skills: number; // 0-40
  breadth: number; // 0-10
  verification: number; // 0-20
  certificates: number; // 0-20
  courses: number; // 0-10
}

export interface PortfolioScore {
  score: number; // 0-100
  breakdown: PortfolioBreakdown;
  max: number;
}

const CATEGORIES = ['technical', 'soft', 'domain', 'tool'];

/**
 * Deterministic 0-100 portfolio strength score.
 * skills depth (0-40) + category breadth (0-10) + verified skills (0-20)
 * + certificates (0-20) + ongoing course progress (0-10).
 */
export function computePortfolioScore(
  skills: Skill[],
  certificates: Certificate[],
  courses: OngoingCourse[]
): PortfolioScore {
  const skillsPoints = Math.min(
    40,
    skills.reduce((sum, s) => sum + Math.min(s.confidence || 0, 1) * 2, 0)
  );

  const categories = new Set(skills.map((s) => (s.category || 'other').toLowerCase()).filter((c) => CATEGORIES.includes(c)));
  const breadth = Math.min(10, categories.size * 2.5);

  const verification = Math.min(20, skills.filter((s) => s.is_verified).length * 4);

  const certificatesPoints = Math.min(20, (certificates || []).length * 5);

  const coursesPoints = Math.min(
    10,
    (courses || []).filter((c) => (c.progress || 0) > 0).length * 2
  );

  const breakdown: PortfolioBreakdown = {
    skills: Math.round(skillsPoints),
    breadth: Math.round(breadth),
    verification,
    certificates: certificatesPoints,
    courses: coursesPoints,
  };

  const score = Math.round(
    skillsPoints + breadth + verification + certificatesPoints + coursesPoints
  );

  return { score, breakdown, max: 100 };
}
