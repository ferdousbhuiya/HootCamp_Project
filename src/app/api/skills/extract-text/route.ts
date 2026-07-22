import { NextRequest, NextResponse } from 'next/server';
import { extractTextFromPDF, extractTextFromDOCX } from '@/lib/ai/parser';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    let text = '';

    if (file.type === 'application/pdf') {
      text = await extractTextFromPDF(buffer);
    } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      text = await extractTextFromDOCX(buffer);
    } else if (file.type === 'text/plain') {
      text = buffer.toString('utf-8');
    } else {
        return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
    }

    return NextResponse.json({ text });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Text extraction failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
