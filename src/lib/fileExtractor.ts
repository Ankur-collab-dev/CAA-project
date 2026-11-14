import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Configure pdfjs worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.txt'];
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export function getFileExtension(filename: string): string {
  return filename.slice(filename.lastIndexOf('.') + 1).toLowerCase();
}

export function isAllowedFileType(filename: string): boolean {
  const lower = filename.toLowerCase();
  return ALLOWED_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

export async function extractTextFromFile(file: File): Promise<string> {
  if (!isAllowedFileType(file.name)) {
    throw new Error('Unsupported file type. Please upload a PDF, DOCX or TXT file.');
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error('This file is larger than 10 MB. Please upload a smaller file.');
  }

  const lower = file.name.toLowerCase();
  if (lower.endsWith('.pdf')) {
    return extractFromPdf(file);
  } else if (lower.endsWith('.docx')) {
    return extractFromDocx(file);
  } else {
    return file.text();
  }
}

async function extractFromPdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
  const pdfDoc = await loadingTask.promise;
  const pagesText: string[] = [];

  for (let i = 1; i <= pdfDoc.numPages; i++) {
    const page = await pdfDoc.getPage(i);
    const content = await page.getTextContent();
    const pageStr = content.items
      .map((item) => ('str' in item ? (item as { str: string }).str : ''))
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (pageStr) {
      pagesText.push(pageStr);
    }
  }

  return pagesText.join('\n\n');
}

async function extractFromDocx(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value.trim();
}

