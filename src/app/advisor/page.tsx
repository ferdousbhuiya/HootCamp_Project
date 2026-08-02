'use client';

import { useAuthContext } from '@/context/AuthContext';
import { useSkills } from '@/hooks/useSkills';
import { useCertificates } from '@/hooks/useCertificates';
import { useOngoingCourses } from '@/hooks/useOngoingCourses';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import AdvisorChat from '@/components/career/AdvisorChat';

export default function AdvisorPage() {
  const { user } = useAuthContext();
  const { skills } = useSkills();
  const { certificates } = useCertificates();
  const { courses } = useOngoingCourses();

  const hasPortfolio = skills.length > 0 || certificates.length > 0 || courses.length > 0;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8 rounded-2xl bg-gradient-to-r from-primary-600 via-violet-600 to-rose-500 p-8 text-white shadow-glow">
        <h1 className="text-3xl font-bold">AI Career Advisor</h1>
        <p className="mt-2 max-w-2xl text-primary-50">
          Chat with an advisor that knows your skills, certificates, courses, and career goals — and recommends real courses from our catalog.
        </p>
      </div>

      {!user ? (
        <Card className="text-center">
          <p className="text-slate-600">Sign in to talk with your career advisor.</p>
          <div className="mt-4">
            <a href="/auth/login">
              <Button>Sign In</Button>
            </a>
          </div>
        </Card>
      ) : !hasPortfolio ? (
        <Card className="text-center">
          <p className="text-slate-600">
            Build your portfolio first so the advisor has something to work with.
          </p>
          <div className="mt-4">
            <a href="/upload">
              <Button>Build Your Portfolio</Button>
            </a>
          </div>
        </Card>
      ) : (
        <AdvisorChat userId={user.id} />
      )}
    </div>
  );
}
