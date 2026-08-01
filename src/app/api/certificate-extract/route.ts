import { NextRequest, NextResponse } from 'next/server';
import {
  extractTextFromDOCX,
  extractTextFromImage,
  extractTextFromPDF,
} from '@/lib/ai/parser';
import { extractCertificateMetadata } from '@/lib/ai/certificateParser';
import { extensionOf, MAX_TEXT_CHARS, validateUpload } from '@/lib/security/validation';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    console.log('Certificate extraction request received, file:', file?.name);

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const validationError = validateUpload(file);
    if (validationError) {
      console.error('Validation error:', validationError);
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const extension = extensionOf(file.name);
    console.log('File extension:', extension, 'File size:', bytes.byteLength);
    
    let rawText: string;

    if (extension === 'pdf') {
      console.log('Extracting text from PDF...');
      rawText = await extractTextFromPDF(buffer);
      console.log('PDF extraction result length:', rawText.length);
    } else if (extension === 'docx' || extension === 'doc') {
      console.log('Extracting text from DOCX/DOC...');
      rawText = await extractTextFromDOCX(buffer);
      console.log('DOCX extraction result length:', rawText.length);
    } else if (extension === 'txt') {
      console.log('Reading text file...');
      rawText = buffer.toString('utf-8');
      console.log('TXT extraction result length:', rawText.length);
    } else if (['png', 'jpg', 'jpeg'].includes(extension)) {
      console.log('Extracting text from image using OCR...');
      rawText = await extractTextFromImage(buffer);
      console.log('OCR extraction result length:', rawText.length);
    } else {
      return NextResponse.json(
        { error: 'Unsupported file type. Upload a PDF, DOCX, DOC, TXT, PNG, or JPG file.' },
        { status: 400 }
      );
    }

    console.log('Text extracted, length:', rawText.length);
    const text = rawText.trim().slice(0, MAX_TEXT_CHARS);
    if (!text) {
      console.error('Text extraction returned empty string for file type:', extension);
      return NextResponse.json(
        { error: `Could not extract text from certificate. The file may be empty or corrupted. File type: ${extension}` },
        { status: 400 }
      );
    }

    console.log('Extracting certificate metadata using AI...');
    // Extract certificate metadata using AI
    const metadata = await extractCertificateMetadata(text);

    return NextResponse.json({ 
      success: true,
      metadata,
      text,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Certificate extraction failed:', message, error);
    return NextResponse.json({ error: `Failed to extract certificate information: ${message}` }, { status: 500 });
  }
}
