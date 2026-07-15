import { NextRequest, NextResponse } from 'next/server';
import { parseResumeToSkills, extractTextFromPDF, extractTextFromDOCX } from '@/lib/ai/parser';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let text: string;
    if (file.name.endsWith('.pdf')) {
      text = await extractTextFromPDF(buffer);
    } else if (file.name.endsWith('.docx')) {
      text = await extractTextFromDOCX(buffer);
    } else {
      text = buffer.toString('utf-8');
    }

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: 'Could not extract text from file' }, { status: 400 });
    }

    const skills = await parseResumeToSkills(text);

    return NextResponse.json({ skills });
  } catch (error) {
    console.error('Skill extraction error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: `Skill extraction failed: ${errorMessage}` }, { status: 500 });
  }
}
