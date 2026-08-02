'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import { useSkills } from '@/hooks/useSkills';
import { useCertificates } from '@/hooks/useCertificates';
import { useOngoingCourses } from '@/hooks/useOngoingCourses';
import { useCareerRoles } from '@/hooks/useCareerRoles';
import { useCareerGoal } from '@/hooks/useCareerGoal';
import { useRoadmap } from '@/hooks/useRoadmap';
import { useCourses } from '@/hooks/useCourses';
import { useRoleCompare } from '@/hooks/useRoleCompare';
import { useGoalProgress } from '@/hooks/useGoalProgress';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import RoleSelector from '@/components/career/RoleSelector';
import GapAnalysisCard from '@/components/career/GapAnalysisCard';
import RoadmapTimeline from '@/components/career/RoadmapTimeline';
import CourseRecommendationList from '@/components/career/CourseRecommendationList';
import RoleComparisonView from '@/components/career/RoleComparison';
import GoalProgressCard from '@/components/career/GoalProgressCard';
import type { JobRole, GapAnalysis } from '@/types';

export default function CareerPage() {
  const { user } = useAuthContext();
  const { skills } = useSkills();
  const { certificates } = useCertificates();
  const { courses } = useOngoingCourses();
  const { roles, loading: rolesLoading } = useCareerRoles();
  const { goals, analyzing, error, loadGoals, analyzeGap, findGoalForRole } = useCareerGoal();
  const { roadmap, generating: roadmapGenerating, loadRoadmap, generateRoadmap } = useRoadmap();
  const { recommendations, recommending, fetchCatalog, recommend } = useCourses();
  const { comparisons, comparing, error: compareError, compareRoles } = useRoleCompare();
  const { progress, loading: progressLoading, setting: settingGoal, error: goalError, loadProgress, setActiveGoal } = useGoalProgress();

  const [selectedRole, setSelectedRole] = useState<JobRole | null>(null);
  const [gapAnalysis, setGapAnalysis] = useState<GapAnalysis | null>(null);
  const [gapPersisted, setGapPersisted] = useState(true);
  const [compareSelected, setCompareSelected] = useState<Set<string>>(new Set());

  const toggleCompareRole = useCallback((roleId: string) => {
    setCompareSelected((prev) => {
      const next = new Set(prev);
      if (next.has(roleId)) next.delete(roleId);
      else if (next.size < 3) next.add(roleId);
      return next;
    });
  }, []);

  const handleCompare = async () => {
    if (!user || compareSelected.size < 2) return;
    const selectedRoles = roles.filter((r) => compareSelected.has(r.id));
    await compareRoles(
      user.id,
      selectedRoles.map((r) => ({ roleId: r.id, roleTitle: r.title })),
      skills,
      certificates,
      courses
    );
  };

  useEffect(() => {
    if (user?.id) loadGoals(user.id);
  }, [user?.id, loadGoals]);

  useEffect(() => {
    if (user?.id) loadProgress(user.id);
  }, [user?.id, loadProgress]);

  useEffect(() => {
    fetchCatalog();
  }, [fetchCatalog]);

  const handleSelectRole = useCallback((role: JobRole) => {
    setSelectedRole(role);
    setGapAnalysis(null);
    setGapPersisted(true);

    // Restore cached goal + roadmap if previously analyzed
    const saved = findGoalForRole(role.title);
    if (saved?.gap_analysis && user?.id) {
      setGapAnalysis(saved.gap_analysis);
      setGapPersisted(true);
      recommend(saved.gap_analysis.missing_skills);
      loadRoadmap(user.id, role.title);
    }
  }, [findGoalForRole, user?.id, recommend, loadRoadmap]);

  const handleAnalyze = async () => {
    if (!user || !selectedRole) return;
    const result = await analyzeGap(user.id, selectedRole, skills, certificates, courses);
    if (result) {
      setGapAnalysis(result);
      setGapPersisted(true);
      recommend(result.missing_skills);
    }
  };

  const handleGenerateRoadmap = async () => {
    if (!user || !selectedRole) return;
    await generateRoadmap(user.id, selectedRole, skills, gapAnalysis || undefined, certificates, courses);
  };

  const handleSetActiveGoal = async () => {
    if (!user || !selectedRole) return;
    const result = await setActiveGoal(user.id, selectedRole.title);
    if (result) {
      // Refresh goals so the "previously analyzed" state stays accurate
      await loadGoals(user.id);
    }
  };

  const hasPortfolio = skills.length > 0 || certificates.length > 0 || courses.length > 0;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8 rounded-2xl bg-gradient-to-r from-primary-600 via-violet-600 to-rose-500 p-8 text-white shadow-glow">
        <h1 className="text-3xl font-bold">Career Compass</h1>
        <p className="mt-2 max-w-2xl text-primary-50">
          Pick a target role, see exactly what you&apos;re missing, and get a personalized plan to get hired.
        </p>
      </div>

      {!hasPortfolio ? (
        <Card className="mt-8 text-center">
          <p className="text-slate-600">
            Build your portfolio first to see accurate career analysis.
          </p>
          <div className="mt-4">
            <a href="/upload">
              <Button>Build Your Portfolio</Button>
            </a>
          </div>
        </Card>
      ) : (
        <div className="mt-8 space-y-8">
          {/* Role selection */}
          <Card>
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 text-sm font-bold text-violet-700">1</span>
              <h2 className="text-lg font-semibold text-slate-900">Choose your target role</h2>
            </div>
            {rolesLoading ? (
              <div className="space-y-2">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-12 animate-pulse rounded-lg bg-slate-100" />
                ))}
              </div>
            ) : (
              <RoleSelector
                roles={roles}
                analyzedTitles={goals.map((g) => g.role_title)}
                selectedRole={selectedRole}
                onSelect={handleSelectRole}
              />
            )}
          </Card>

          {error && (
            <Card className="border-red-200 bg-red-50">
              <p className="text-sm font-semibold text-red-700">{error}</p>
            </Card>
          )}

          {/* Analyze action */}
          {selectedRole && !gapAnalysis && (
            <Card className="text-center">
              <p className="text-sm text-slate-600">
                See how close you are to becoming a <strong>{selectedRole.title}</strong>.
              </p>
              <div className="mt-4">
                <Button onClick={handleAnalyze} disabled={analyzing}>
                  {analyzing ? 'Analyzing your portfolio...' : 'Analyze My Fit'}
                </Button>
              </div>
            </Card>
          )}

          {/* Gap analysis */}
          {selectedRole && gapAnalysis && (
            <GapAnalysisCard
              role={selectedRole}
              analysis={gapAnalysis}
              persisted={gapPersisted}
              onSetActive={handleSetActiveGoal}
              isActiveGoal={progress?.role_title.toLowerCase() === selectedRole.title.toLowerCase()}
              settingGoal={settingGoal}
            />
          )}

          {/* Goal progress */}
          {progress && (
            <Card>
              <GoalProgressCard progress={progress} />
            </Card>
          )}

          {goalError && (
            <Card className="border-red-200 bg-red-50">
              <p className="text-sm font-semibold text-red-700">{goalError}</p>
            </Card>
          )}

          {/* Roadmap */}
          {selectedRole && gapAnalysis && (
            <Card>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-100 text-sm font-bold text-primary-700">2</span>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">Your Career Roadmap</h2>
                    <p className="text-sm text-slate-500">
                      A phased plan to close the gap and land a {selectedRole.title} role.
                    </p>
                  </div>
                </div>
                {!roadmap && (
                  <Button onClick={handleGenerateRoadmap} disabled={roadmapGenerating}>
                    {roadmapGenerating ? 'Building your roadmap...' : 'Generate Roadmap'}
                  </Button>
                )}
              </div>

              {roadmapGenerating ? (
                <div className="space-y-3">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="h-32 animate-pulse rounded-lg bg-slate-100" />
                  ))}
                </div>
              ) : roadmap ? (
                <RoadmapTimeline roadmap={roadmap} />
              ) : (
                <p className="py-4 text-center text-sm text-slate-400">
                  Generate a roadmap to see your milestones, skills, and recommended courses by phase.
                </p>
              )}
            </Card>
          )}

          {/* Course recommendations */}
          {selectedRole && gapAnalysis && (
            <Card>
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-sm font-bold text-emerald-700">3</span>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Courses to close the gap</h2>
                  <p className="text-sm text-slate-500">
                    Real courses that teach your missing skills for {selectedRole.title}.
                  </p>
                </div>
              </div>
              <CourseRecommendationList
                recommendations={recommendations}
                loading={recommending}
                catalogEmpty={recommendations.length === 0 && !recommending}
              />
            </Card>
          )}

          {/* Role comparison */}
          {hasPortfolio && (
            <Card>
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 text-sm font-bold text-violet-700">4</span>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Compare career paths</h2>
                  <p className="text-sm text-slate-500">
                    Pick up to 3 roles to see which fits you best.
                  </p>
                </div>
              </div>

              {!rolesLoading && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {roles.map((role) => {
                    const isSelected = compareSelected.has(role.id);
                    return (
                      <button
                        key={role.id}
                        onClick={() => toggleCompareRole(role.id)}
                        className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                          isSelected
                            ? 'border-violet-500 bg-violet-50 text-violet-700'
                            : 'border-slate-300 bg-white text-slate-700 hover:border-violet-300'
                        }`}
                      >
                        {role.title}
                      </button>
                    );
                  })}
                </div>
              )}

              <Button
                onClick={handleCompare}
                disabled={comparing || compareSelected.size < 2}
                className="mb-4"
              >
                {comparing ? 'Comparing roles...' : `Compare (${compareSelected.size}/3 selected)`}
              </Button>

              {compareError && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {compareError}
                </div>
              )}

              {comparing ? (
                <div className="space-y-2">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="h-16 animate-pulse rounded-lg bg-slate-100" />
                  ))}
                </div>
              ) : (
                <RoleComparisonView comparisons={comparisons} />
              )}
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
