import { randomUUID } from 'crypto';
import { createWorker } from 'tesseract.js';
import { callAIWithFallback } from './unified';
import type { Skill } from '@/types';
import { cleanText, clampConfidence } from '@/lib/security/validation';

export async function parseResumeToSkills(text: string, userId: string, source: 'resume' | 'certificate' | 'manual' = 'resume'): Promise<Skill[]> {
  const sourceText = source === 'certificate' ? 'certificate' : 'resume';
  const prompt = `Extract skills from this ${sourceText} text. Return a JSON array of objects with:
- name
- category: one of [technical, soft, domain, tool]
- confidence: 0.0 to 1.0
${sourceText} text:
${text}
Return ONLY valid JSON array.`;
  const result = await callAIWithFallback(prompt);
  let cleaned = '';
  try {
    cleaned = result.replace(/```json/gi, '').replace(/```/g, '').trim();
    const json: unknown = JSON.parse(cleaned);
    if (!Array.isArray(json)) return [];
    return json.map((item: any): Skill => ({
      id: randomUUID(),
      user_id: userId,
      name: cleanText(item?.name, 80),
      category: cleanText(item?.category, 30).toLowerCase() || 'technical',
      confidence: clampConfidence(item?.confidence),
      source: source,
      verification_source: source === 'certificate' ? 'certificate' : 'resume',
      is_verified: source === 'certificate',
    })).filter((skill) => skill.name.length > 0);
  } catch (error) {
    console.error('Failed to parse skills JSON:', error);
    return [];
  }
}

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  // Try text-layer extraction first (fast path for digital PDFs)
  try {
    const pdfParse = (await import('pdf-parse')).default;
    const data = await pdfParse(buffer);
    const text = (data.text || '').trim();
    if (text.length > 0) return text;
  } catch (error) {
    console.warn('pdf-parse failed, falling back to OCR:', error);
  }

  // Scanned/image-only PDFs have no text layer — render pages and OCR them
  const ocrText = await extractTextFromScannedPDF(buffer);
  const trimmed = ocrText.trim();
  if (trimmed.length === 0) {
    throw new Error('Could not extract text from PDF. If this is a scanned document, ensure the pages are clear and upright.');
  }
  return trimmed;
}

async function extractTextFromScannedPDF(buffer: Buffer): Promise<string> {
  const path = await import('path');
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.js');
  const { createCanvas } = await import('canvas');
  const { createWorker } = await import('tesseract.js');

  const worker = await createWorker('eng', 1, {
    logger: () => {},
  });

  try {
    const data = new Uint8Array(buffer);
    const doc = await pdfjs.getDocument({
      data,
      // Point pdfjs at its shipped font/cmap assets so text and scans render correctly.
      standardFontDataUrl: path.join(process.cwd(), 'node_modules/pdfjs-dist/standard_fonts/'),
      cMapUrl: path.join(process.cwd(), 'node_modules/pdfjs-dist/cmaps/'),
      cMapPacked: true,
    }).promise;

    const chunks: string[] = [];
    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i);
      const viewport = page.getViewport({ scale: 2 });
      const canvas = createCanvas(viewport.width, viewport.height);
      const ctx = canvas.getContext('2d');
      await page.render({ canvasContext: ctx, viewport }).promise;
      const png = canvas.toBuffer('image/png');
      const ret = await worker.recognize(png);
      const text = (ret.data.text || '').trim();
      if (text) chunks.push(text);
      page.cleanup();
    }

    await doc.destroy();
    return chunks.join('\n');
  } finally {
    await worker.terminate();
  }
}

export async function extractTextFromDOCX(buffer: Buffer): Promise<string> {
  const mammoth = await import('mammoth');
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

export async function extractTextFromImage(buffer: Buffer): Promise<string> {
  try {
    console.log('Starting OCR extraction...');
    const worker = await createWorker('eng', 1, {
      logger: (m) => console.log(m),
    });
    console.log('Worker created, starting recognition...');
    const ret = await worker.recognize(buffer);
    console.log('Recognition complete, terminating worker...');
    await worker.terminate();
    console.log('OCR extraction successful');
    return ret.data.text;
  } catch (error) {
    console.error('OCR extraction failed:', error);
    throw new Error('Failed to extract text from image using OCR. Please ensure the image is clear and contains readable text.');
  }
}

