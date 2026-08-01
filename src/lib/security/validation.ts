export const MAX_FILE_BYTES = 10 * 1024 * 1024;
export const MAX_TEXT_CHARS = 120_000;
export const ALLOWED_EXTENSIONS = new Set(['pdf', 'docx', 'doc', 'txt', 'jpeg', 'jpg', 'png']);
export const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'text/plain',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'application/octet-stream',
]);

export function extensionOf(name: string): string {
  const safeName = name.replace(/[^a-zA-Z0-9._-]/g, '_');
  return safeName.split('.').pop()?.toLowerCase() ?? '';
}

export function validateUpload(file: File | null): string | null {
  if (!file) return 'Choose a document before continuing.';
  if (file.size === 0) return 'This file is empty. Choose a document with content.';
  if (file.size > MAX_FILE_BYTES) return 'This file is larger than 10 MB. Choose a smaller document.';
  const extension = extensionOf(file.name);
  if (!ALLOWED_EXTENSIONS.has(extension)) return 'File type not supported. Use PDF, DOCX, DOC, TXT, JPEG, JPG, or PNG.';
  // Allow files without MIME type or with application/octet-stream (common for PDFs)
  if (file.type && !ALLOWED_MIME_TYPES.has(file.type) && file.type !== 'application/octet-stream') {
    return 'The file type does not match an accepted document format.';
  }
  return null;
}

export function clampConfidence(value: unknown): number {
  const number = typeof value === 'number' && Number.isFinite(value) ? value : 0.5;
  return Math.max(0, Math.min(1, number));
}

export function cleanText(value: unknown, max = 160): string {
  return typeof value === 'string' ? value.replace(/[<>]/g, '').trim().slice(0, max) : '';
}

export function isMatchType(value: unknown): value is 'job' | 'learning_path' | 'credential' {
  return value === 'job' || value === 'learning_path' || value === 'credential';
}
