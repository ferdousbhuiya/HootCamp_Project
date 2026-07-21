import { NextRequest, NextResponse } from 'next/server';
import { findMatches } from '@/lib/ai/matcher';
import type { Skill } from '@/types';
import { isMatchType } from '@/lib/security/validation';

export const runtime = 'nodejs';
export const maxDuration = 45;

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { skills?: Skill[]; matchType?: string };
    const { skills, matchType } = body;

    if (!Array.isArray(skills) || skills.length === 0) return NextResponse.json({ error: 'No skills provided' }, { status: 400 });
    if (!isMatchType(matchType)) return NextResponse.json({ error: 'Invalid match type' }, { status: 400 });

    const matches = await findMatches(skills, matchType);

    return NextResponse.json({ matches });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: `Match finding failed: ${errorMessage}` }, { status: 500 });
  }
}
