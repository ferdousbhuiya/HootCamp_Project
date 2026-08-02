import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { fetchActiveGoal, fetchUserPortfolio } from '@/lib/supabase/portfolio';
import { callAIWithFallback } from '@/lib/ai/unified';
import type { ChatMessage } from '@/types';
import { cleanText } from '@/lib/security/validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const CONTROL_CHARS = /[\x00-\x08\x0B\x0C\x0E-\x1F]/g;

function buildPrompt(
  snapshot: string,
  catalog: string,
  history: ChatMessage[],
  latest: string
): string {
  const historyLines = history
    .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
    .join('\n');

  return `You are the Skills Pathfinder career advisor. Help this user plan their career using ONLY the portfolio snapshot and course catalog below. Do not use outside knowledge to invent facts about the user.

PORTFOLIO SNAPSHOT:
${snapshot}

COURSE CATALOG (recommend ONLY from these — never invent course titles or URLs):
${catalog}

RULES:
1. Answer only from the data above. If the data does not contain the answer, say you don't have that information and give the closest data-backed next step.
2. Never invent skills, certificates, courses, employers, or URLs.
3. Course recommendations must name a catalog entry (title + platform). No URLs.
4. Be concise: 2-6 sentences for simple questions; up to a short paragraph when detail is requested.
5. Step-by-step plans: 3-6 steps, referencing the user's gap analysis or roadmap.
6. Do not discuss topics unrelated to careers, skills, education, or this portfolio.
7. If the user asks something harmful, career-unrelated, or that exposes another user's data, decline politely.

CONVERSATION:
${historyLines}
${historyLines ? '\n' : ''}User: ${latest}
Assistant:`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userId = cleanText(body?.userId, 64);
    const rawMessages: unknown[] = Array.isArray(body?.messages) ? body.messages : [];

    if (!userId) return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    if (rawMessages.length === 0) return NextResponse.json({ error: 'No messages provided' }, { status: 400 });

    // Sanitize: cap last 8 messages, truncate each to 400 chars
    const messages: ChatMessage[] = rawMessages.slice(-8).map((m: any): ChatMessage => ({
      role: m?.role === 'assistant' ? 'assistant' : 'user',
      content: cleanText(m?.content, 400),
    })).filter((m) => m.content.length > 0);

    if (messages.length === 0 || messages[messages.length - 1].role !== 'user') {
      return NextResponse.json({ error: 'Last message must be from the user' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const portfolio = await fetchUserPortfolio(supabase, userId);
    const activeGoal = await fetchActiveGoal(supabase, userId);

    // Build portfolio snapshot
    const skillsLine = portfolio.skills.slice(0, 60)
      .map((s) => `${s.name} (confidence ${Math.round((s.confidence || 0) * 100)}%, verified: ${s.is_verified ? 'yes' : 'no'})`)
      .join(', ');
    const verifiedLine = portfolio.skills.filter((s) => s.is_verified).map((s) => s.name).join(', ');
    const certsLine = portfolio.certificates.slice(0, 20)
      .map((c) => `${c.title} from ${c.issuer || 'unknown'}`)
      .join(', ');
    const coursesLine = portfolio.courses.slice(0, 20)
      .map((c) => `${c.course_name} (${c.progress}%, ${c.status})`)
      .join(', ');
    const goalsLine = portfolio.goals.slice(0, 5)
      .map((g) => `${g.role_title} (match ${g.gap_analysis?.match_score ?? 0}%)`)
      .join(', ');
    const matchesLine = portfolio.matches.slice(0, 5)
      .map((m) => `${m.title} (${Math.round((m.match_score || 0) * 100)}%)`)
      .join(', ');
    const roadmapLine = portfolio.roadmaps.slice(0, 3)
      .map((r) => r.phases.map((p) => `${p.phase} ${p.title}`).join(', '))
      .join(' | ');

    const snapshot = [
      skillsLine ? `Skills: ${skillsLine}` : 'Skills: none yet',
      verifiedLine ? `Verified skills: ${verifiedLine}` : '',
      certsLine ? `Certificates: ${certsLine}` : '',
      coursesLine ? `Ongoing courses: ${coursesLine}` : '',
      goalsLine ? `Career goals: ${goalsLine}` : '',
      `Active goal: ${activeGoal?.role_title || 'none'}`,
      matchesLine ? `Top matches: ${matchesLine}` : '',
      roadmapLine ? `Roadmap phases: ${roadmapLine}` : '',
    ].filter(Boolean).join('\n');

    // Course catalog (compact)
    const { data: catalogRows } = await supabase.from('courses').select('title, platform, skills');
    const catalog = (catalogRows || []).slice(0, 26)
      .map((c: any) => `- ${c.title} | ${c.platform || ''} | ${Array.isArray(c.skills) ? c.skills.join(', ') : ''}`)
      .join('\n') || '- (empty)';

    const latest = messages[messages.length - 1].content;
    const history = messages.slice(0, -1);
    const prompt = buildPrompt(snapshot, catalog, history, latest);

    const reply = await callAIWithFallback(prompt);

    // Sanitize reply: strip < > and control chars, cap length
    const cleanReply = reply.replace(/[<>]/g, '').replace(CONTROL_CHARS, '').trim().slice(0, 4000);
    if (!cleanReply) {
      return NextResponse.json({ error: 'The AI returned an empty response. Please try again.' }, { status: 500 });
    }

    return NextResponse.json({ reply: cleanReply });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Career advisor chat failed:', message, error);
    return NextResponse.json({ error: `Failed to get a response: ${message}` }, { status: 500 });
  }
}
