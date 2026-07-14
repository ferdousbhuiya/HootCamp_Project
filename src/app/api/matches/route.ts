import { NextRequest, NextResponse } from 'next/server';
import { findMatches } from '@/lib/ai/matcher';
import type { Skill } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { skills, matchType } = await request.json() as {
      skills: Skill[];
      matchType: 'job' | 'learning_path' | 'credential';
    };

    if (!skills || skills.length === 0) {
      return NextResponse.json({ error: 'No skills provided' }, { status: 400 });
    }

    const matches = await findMatches(skills, matchType);

    return NextResponse.json({ matches });
  } catch (error) {
    return NextResponse.json({ error: 'Match finding failed' }, { status: 500 });
  }
}
