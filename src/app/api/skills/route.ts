import { NextRequest, NextResponse } from 'next/server';
import {
  extractTextFromDOCX,
  extractTextFromImage,
  extractTextFromPDF,
  parseResumeToSkills,
} from '@/lib/ai/parser';
import { extensionOf, MAX_TEXT_CHARS, validateUpload } from '@/lib/security/validation';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const validationError = validateUpload(file);
    if (validationError) return NextResponse.json({ error: validationError }, { status: 400 });

    const bytes = await file!.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const extension = extensionOf(file!.name);
    let rawText: string;

    if (extension === 'pdf') {
      rawText = await extractTextFromPDF(buffer);
    } else if (extension === 'docx') {
      rawText = await extractTextFromDOCX(buffer);
    } else if (extension === 'txt') {
      rawText = buffer.toString('utf-8');
    } else if (['png', 'jpg', 'jpeg'].includes(extension)) {
      rawText = await extractTextFromImage(buffer);
    } else {
      return NextResponse.json(
        { error: 'Unsupported file type. Upload a PDF, DOCX, TXT, PNG, or JPG file.' },
        { status: 400 }
      );
    }

    const text = rawText.trim().slice(0, MAX_TEXT_CHARS);
    if (!text) {
      return NextResponse.json(
        { error: 'Could not extract text. Upload a text-based PDF, DOCX, or TXT file.' },
        { status: 400 }
      );
    }

    const skills = await parseResumeToSkills(text);
    return NextResponse.json({ skills });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Resume parsing failed:', message, error);
    return NextResponse.json({ error: `Server error parsing resume: ${message}` }, { status: 500 });
  }
}
