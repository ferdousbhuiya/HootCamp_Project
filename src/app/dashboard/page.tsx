'use client';

import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { useSkills } from '@/hooks/useSkills';
import { useMatches } from '@/hooks/useMatches';
import { useCertificates } from '@/hooks/useCertificates';
import { useOngoingCourses } from '@/hooks/useOngoingCourses';
import { computePortfolioScore } from '@/lib/portfolioScore';
import { usePortfolioFeedback } from '@/hooks/usePortfolioFeedback';
import PortfolioScoreCard from '@/components/dashboard/PortfolioScoreCard';
import SkillDistributionChart from '@/components/dashboard/SkillDistributionChart';
import PortfolioFeedbackCard from '@/components/career/PortfolioFeedbackCard';

export default function DashboardPage() {
  const { skills } = useSkills();
  const { matches } = useMatches();
  const { certificates } = useCertificates();
  const { courses } = useOngoingCourses();

  const verifiedSkills = skills.filter(s => s.is_verified).length;
  const totalPortfolioItems = skills.length + certificates.length + courses.length;
  const portfolioScore = computePortfolioScore(skills, certificates, courses);
  const { feedback, loading: feedbackLoading, error: feedbackError, getFeedback } = usePortfolioFeedback();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10 max-w-3xl">
        <h1 className="text-4xl font-semibold tracking-tight text-slate-900">Dashboard</h1>
        <p className="mt-3 text-lg leading-8 text-slate-600">Build your comprehensive portfolio with resumes, certificates, and ongoing courses.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <p className="text-sm font-medium text-slate-500">Total Skills</p>
            <p className="mt-3 text-4xl font-semibold text-slate-900">{skills.length}</p>
            <p className="mt-2 text-xs text-slate-500">{verifiedSkills} verified</p>
          </Card>
          <Card>
            <p className="text-sm font-medium text-slate-500">Certificates</p>
            <p className="mt-3 text-4xl font-semibold text-slate-900">{certificates.length}</p>
          </Card>
          <Card>
            <p className="text-sm font-medium text-slate-500">Ongoing Courses</p>
            <p className="mt-3 text-4xl font-semibold text-slate-900">{courses.length}</p>
          </Card>
        </div>

        <Card>
          <h2 className="text-xl font-semibold text-slate-900">Build Your Portfolio</h2>
          <p className="mt-2 text-sm text-slate-600">Add documents to build your complete professional profile.</p>
          <div className="mt-6 space-y-3">
            <Link href="/upload?tab=resume" className="block">
              <Button className="w-full">Upload Resume</Button>
            </Link>
            <Link href="/upload?tab=certificate" className="block">
              <Button variant="outline" className="w-full">Add Certificates</Button>
            </Link>
            <Link href="/upload?tab=courses" className="block">
              <Button variant="outline" className="w-full">Track Courses</Button>
            </Link>
          </div>
        </Card>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 text-xl font-semibold text-slate-900">Portfolio Score</h2>
          <PortfolioScoreCard score={portfolioScore} />
        </Card>
        <Card>
          <h2 className="mb-4 text-xl font-semibold text-slate-900">Skill Distribution</h2>
          <SkillDistributionChart skills={skills} />
        </Card>
      </div>

      {totalPortfolioItems > 0 && (
        <div className="mt-8">
          <Card>
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Portfolio Summary</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 bg-primary-50 rounded-lg">
                <p className="text-sm font-medium text-primary-900">Skills</p>
                <p className="mt-2 text-2xl font-semibold text-primary-900">{skills.length}</p>
                <p className="mt-1 text-xs text-primary-700">From all sources</p>
              </div>
              <div className="p-4 bg-emerald-50 rounded-lg">
                <p className="text-sm font-medium text-emerald-900">Certificates</p>
                <p className="mt-2 text-2xl font-semibold text-emerald-900">{certificates.length}</p>
                <p className="mt-1 text-xs text-emerald-700">Verified achievements</p>
              </div>
              <div className="p-4 bg-violet-50 rounded-lg">
                <p className="text-sm font-medium text-violet-900">Courses</p>
                <p className="mt-2 text-2xl font-semibold text-violet-900">{courses.length}</p>
                <p className="mt-1 text-xs text-violet-700">In progress</p>
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <Link href="/skills" className="block">
                <Button variant="outline" className="w-full">View All Skills</Button>
              </Link>
              <Link href="/matches" className="block">
                <Button variant="outline" className="w-full">View Job Matches</Button>
              </Link>
            </div>
          </Card>
        </div>
      )}

      {totalPortfolioItems > 0 && (
        <div className="mt-8">
          <Card>
            <h2 className="mb-4 text-xl font-semibold text-slate-900">AI Portfolio Feedback</h2>
            <p className="mb-4 text-sm text-slate-500">
              Get an AI review of your strengths, gaps, and keywords employers look for.
            </p>
            <PortfolioFeedbackCard
              feedback={feedback}
              loading={feedbackLoading}
              error={feedbackError}
              onGetFeedback={() => getFeedback(skills, certificates, courses)}
            />
          </Card>
        </div>
      )}
    </div>
  );
}
