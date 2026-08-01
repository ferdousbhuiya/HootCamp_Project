declare module 'pdf-parse' {
  interface PDFData {
    numpages: number;
    numrender: number;
    info: Record<string, unknown>;
    metadata: unknown;
    text: string;
    version: string;
  }

  function pdfParse(
    dataBuffer: Buffer,
    options?: Record<string, unknown>
  ): Promise<PDFData>;

  export default pdfParse;
}

declare module 'pdfjs-dist/build/pdf.js' {
  export const GlobalWorkerOptions: { workerSrc: string };
  export function getDocument(
    params: Record<string, unknown>
  ): { promise: Promise<PDFDocumentProxy> };
  export interface PDFDocumentProxy {
    numPages: number;
    getPage(n: number): Promise<{
      getTextContent(): Promise<{ items: unknown[] }>;
      cleanup(): void;
    }>;
    destroy(): Promise<void>;
  }
}
