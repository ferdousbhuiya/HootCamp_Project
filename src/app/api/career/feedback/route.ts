import { NextRequest, NextResponse } from 'next/server';
import { generatePortfolioFeedback } from '@/lib/ai/feedback';
import type { Skill, Certificate, OngoingCourse } from '@/types';
import { cleanText } from '@/lib/security/validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const skills: Skill[] = Array.isArray(body?.skills) ? body.skills : [];
    const certificates: Certificate[] = Array.isArray(body?.certificates) ? body.certificates : [];
    const ongoingCourses: OngoingCourse[] = Array.isArray(body?.ongoingCourses) ? body.ongoingCourses : [];
    const roleTitle = body?.roleTitle ? cleanText(body.roleTitle, 120) : undefined;

    if (skills.length === 0) {
      return NextResponse.json({ error: 'No skills provided' }, { status: 400 });
    }

    const feedback = await generatePortfolioFeedback(skills, certificates, ongoingCourses, roleTitle);

    return NextResponse.json({ feedback });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Failed to generate portfolio feedback:', message, error);
    return NextResponse.json({ error: `Failed to generate portfolio feedback: ${message}` }, { status: 500 });
  }
}
