import { NextRequest, NextResponse } from 'next/server';
import { callAIWithFallback } from '@/lib/ai/unified';
import type { Skill, Certificate, OngoingCourse, Match } from '@/types';
import { cleanText } from '@/lib/security/validation';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      skills: Skill[];
      certificates: Certificate[];
      ongoingCourses: OngoingCourse[];
      jobMatches: Match[];
      learningMatches: Match[];
    };

    const { skills, certificates, ongoingCourses, jobMatches, learningMatches } = body;

    const skillList = skills.map(s => cleanText(s.name, 80)).join(', ');
    const verifiedSkills = skills.filter(s => s.is_verified).map(s => cleanText(s.name, 80)).join(', ');
    
    let portfolioContext = '';
    if (certificates && certificates.length > 0) {
      const certList = certificates.map(c => `${c.title} from ${c.issuer} (${c.verification_status})`).join(', ');
      portfolioContext += `\nCertificates: ${certList}`;
    }
    if (ongoingCourses && ongoingCourses.length > 0) {
      const courseList = ongoingCourses.map(c => `${c.course_name} (${c.progress}% complete, ${c.status})`).join(', ');
      portfolioContext += `\nOngoing Courses: ${courseList}`;
    }

    let jobContext = '';
    if (jobMatches && jobMatches.length > 0) {
      jobContext = '\nTop Job Matches:\n' + jobMatches.slice(0, 3).map(m => 
        `- ${m.title} (${Math.round(m.match_score * 100)}% match): ${m.explanation}`
      ).join('\n');
    }

    let learningContext = '';
    if (learningMatches && learningMatches.length > 0) {
      learningContext = '\nTop Learning Paths:\n' + learningMatches.slice(0, 3).map(m => 
        `- ${m.title}: ${m.explanation}`
      ).join('\n');
    }

    const prompt = `Generate a comprehensive career portfolio report based on the following data:

Skills: ${skillList}
${verifiedSkills ? `Verified Skills: ${verifiedSkills}` : ''}
${portfolioContext}
${jobContext}
${learningContext}

Create a detailed report with the following sections:
1. Executive Summary - Overview of the candidate's profile
2. Skills Analysis - Breakdown of skills by category and verification status
3. Portfolio Strengths - Key achievements and certifications
4. Career Recommendations - Top job matches with detailed analysis
5. Learning Path Recommendations - Suggested next steps for skill development
6. Action Plan - Specific, actionable next steps for career advancement

Format the report in a professional, readable format with clear headings and bullet points.
Include specific metrics and percentages where relevant.
Provide actionable advice based on the current portfolio state.`;

    const result = await callAIWithFallback(prompt);
    
    return NextResponse.json({ 
      success: true,
      report: result,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Report generation failed:', errorMessage, error);
    return NextResponse.json({ error: `Failed to generate report: ${errorMessage}` }, { status: 500 });
  }
}
