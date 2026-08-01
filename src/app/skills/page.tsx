'use client';

import { useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { useSkills } from '@/hooks/useSkills';
import { useCertificates } from '@/hooks/useCertificates';
import { useOngoingCourses } from '@/hooks/useOngoingCourses';

export default function SkillsPage() {
  const { skills } = useSkills();
  const { certificates } = useCertificates();
  const { courses } = useOngoingCourses();
  const [filter, setFilter] = useState<'all' | 'verified' | 'resume' | 'certificate' | 'ongoing'>('all');

  const filteredSkills = skills.filter(skill => {
    if (filter === 'all') return true;
    if (filter === 'verified') return skill.is_verified;
    if (filter === 'resume') return skill.verification_source === 'resume';
    if (filter === 'certificate') return skill.verification_source === 'certificate';
    if (filter === 'ongoing') return skill.verification_source === 'ongoing_course';
    return true;
  });

  const skillStats = {
    total: skills.length,
    verified: skills.filter(s => s.is_verified).length,
    fromResume: skills.filter(s => s.verification_source === 'resume').length,
    fromCertificate: skills.filter(s => s.verification_source === 'certificate').length,
    fromOngoing: skills.filter(s => s.verification_source === 'ongoing_course').length,
    manual: skills.filter(s => s.verification_source === 'manual').length,
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10 max-w-3xl">
        <h1 className="text-4xl font-semibold tracking-tight text-slate-900">Your Skills</h1>
        <p className="mt-3 text-lg leading-8 text-slate-600">Complete overview of all skills extracted from your portfolio documents.</p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-6 mb-8">
        <Card>
          <p className="text-sm font-medium text-slate-500">Total Skills</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{skillStats.total}</p>
        </Card>
        <Card>
          <p className="text-sm font-medium text-slate-500">Verified</p>
          <p className="mt-2 text-2xl font-semibold text-emerald-900">{skillStats.verified}</p>
        </Card>
        <Card>
          <p className="text-sm font-medium text-slate-500">From Resume</p>
          <p className="mt-2 text-2xl font-semibold text-primary-900">{skillStats.fromResume}</p>
        </Card>
        <Card>
          <p className="text-sm font-medium text-slate-500">From Certificates</p>
          <p className="mt-2 text-2xl font-semibold text-emerald-900">{skillStats.fromCertificate}</p>
        </Card>
        <Card>
          <p className="text-sm font-medium text-slate-500">From Courses</p>
          <p className="mt-2 text-2xl font-semibold text-violet-900">{skillStats.fromOngoing}</p>
        </Card>
        <Card>
          <p className="text-sm font-medium text-slate-500">Manual</p>
          <p className="mt-2 text-2xl font-semibold text-gray-900">{skillStats.manual}</p>
        </Card>
      </div>

      {/* Portfolio Context */}
      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <Card>
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Certificates ({certificates.length})</h3>
          {certificates.length === 0 ? (
            <p className="text-sm text-slate-500">No certificates uploaded yet.</p>
          ) : (
            <div className="space-y-2">
              {certificates.map(cert => (
                <div key={cert.id} className="flex justify-between items-center text-sm">
                  <span className="font-medium">{cert.title}</span>
                  <Badge variant={cert.verification_status === 'verified' ? 'success' : 'default'}>
                    {cert.verification_status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
        <Card>
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Ongoing Courses ({courses.length})</h3>
          {courses.length === 0 ? (
            <p className="text-sm text-slate-500">No courses in progress.</p>
          ) : (
            <div className="space-y-2">
              {courses.map(course => (
                <div key={course.id} className="text-sm">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{course.course_name}</span>
                    <Badge variant="info">{course.status}</Badge>
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    {course.provider} • {course.progress}% complete
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Skills List */}
      <Card>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-slate-900">All Skills ({filteredSkills.length})</h2>
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              All
            </Button>
            <Button
              variant={filter === 'verified' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilter('verified')}
            >
              Verified
            </Button>
            <Button
              variant={filter === 'resume' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilter('resume')}
            >
              Resume
            </Button>
            <Button
              variant={filter === 'certificate' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilter('certificate')}
            >
              Certificate
            </Button>
            <Button
              variant={filter === 'ongoing' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilter('ongoing')}
            >
              Courses
            </Button>
          </div>
        </div>

        {filteredSkills.length === 0 ? (
          <p className="text-slate-500">No skills found for the selected filter.</p>
        ) : (
          <div className="space-y-3">
            {filteredSkills.map(skill => (
              <div key={skill.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-900">{skill.name}</h3>
                    {skill.is_verified && (
                      <Badge variant="success">✓ Verified</Badge>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                    <span className="capitalize">{skill.category}</span>
                    <span>•</span>
                    <span>Confidence: {Math.round(skill.confidence * 100)}%</span>
                    <span>•</span>
                    <span>From: {skill.verification_source.replace('_', ' ')}</span>
                  </div>
                </div>
                <div className="ml-4">
                  {skill.verification_source === 'certificate' && (
                    <Badge variant="success">Certificate</Badge>
                  )}
                  {skill.verification_source === 'resume' && (
                    <Badge variant="info">Resume</Badge>
                  )}
                  {skill.verification_source === 'ongoing_course' && (
                    <Badge variant="warning">Course</Badge>
                  )}
                  {skill.verification_source === 'manual' && (
                    <Badge variant="default">Manual</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
