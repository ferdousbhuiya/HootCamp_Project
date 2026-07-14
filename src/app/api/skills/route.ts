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

    const skills = await parseResumeToSkills(text);

    return NextResponse.json({ skills });
  } catch (error) {
    return NextResponse.json({ error: 'Skill extraction failed' }, { status: 500 });
  }
}
