import path from 'node:path';

export interface FileValidationResult {
  isValid: boolean;
  detectedMime: string;
  declaredExtension: string;
  error?: string;
}

// Magic byte signatures
const PDF_MAGIC = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2d]); // %PDF-
const ZIP_MAGIC = Buffer.from([0x50, 0x4b, 0x03, 0x04]); // PK\x03\x04 (ZIP, DOCX, PPTX, EPUB)
const EXE_MAGIC = Buffer.from([0x4d, 0x5a]); // MZ (DOS/Windows Executable)
const ELF_MAGIC = Buffer.from([0x7f, 0x45, 0x4c, 0x46]); // \x7fELF (Linux Binary)

const EXTENSION_TO_MIME: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  '.epub': 'application/epub+zip',
  '.zip': 'application/zip',
  '.txt': 'text/plain',
  '.mp4': 'video/mp4',
};

/**
 * Validates the raw binary buffer of an uploaded document using server-side magic byte inspection.
 * Blocks disguised executables, HTML, SVG, and script payloads from pretending to be academic notes.
 */
export function validateFileBuffer(
  buffer: Buffer,
  declaredFileName: string
): FileValidationResult {
  const declaredExtension = path.extname(declaredFileName).toLowerCase();

  if (!buffer || buffer.length === 0) {
    return {
      isValid: false,
      detectedMime: 'application/octet-stream',
      declaredExtension,
      error: 'Empty file buffer received. Please upload a valid document.',
    };
  }

  // 1. Check for malicious executable signatures
  if (buffer.length >= 2 && buffer.subarray(0, 2).equals(EXE_MAGIC)) {
    return {
      isValid: false,
      detectedMime: 'application/x-dosexec',
      declaredExtension,
      error: 'Security Warning: Disguised Windows executable (MZ header) detected and rejected.',
    };
  }

  if (buffer.length >= 4 && buffer.subarray(0, 4).equals(ELF_MAGIC)) {
    return {
      isValid: false,
      detectedMime: 'application/x-executable',
      declaredExtension,
      error: 'Security Warning: Disguised ELF binary detected and rejected.',
    };
  }

  // 2. Check for script / HTML / SVG markup disguised as document
  const headerPreview = buffer.subarray(0, Math.min(buffer.length, 512)).toString('utf-8').trim();
  const lowerHeader = headerPreview.toLowerCase();

  if (
    lowerHeader.startsWith('<!doctype html') ||
    lowerHeader.startsWith('<html') ||
    lowerHeader.startsWith('<script') ||
    lowerHeader.startsWith('<body')
  ) {
    return {
      isValid: false,
      detectedMime: 'text/html',
      declaredExtension,
      error: `Security Warning: Disguised HTML payload detected in declared ${declaredExtension} file. Upload rejected.`,
    };
  }

  if (lowerHeader.startsWith('<svg') || (lowerHeader.startsWith('<?xml') && lowerHeader.includes('<svg'))) {
    return {
      isValid: false,
      detectedMime: 'image/svg+xml',
      declaredExtension,
      error: `Security Warning: Disguised SVG XML payload detected in declared ${declaredExtension} file. Upload rejected.`,
    };
  }

  if (lowerHeader.startsWith('#!/') || lowerHeader.startsWith('<?php')) {
    return {
      isValid: false,
      detectedMime: 'application/x-script',
      declaredExtension,
      error: 'Security Warning: Executable script header detected. Upload rejected.',
    };
  }

  // 3. Validate PDF magic bytes
  if (declaredExtension === '.pdf') {
    if (buffer.length >= 5 && buffer.subarray(0, 5).equals(PDF_MAGIC)) {
      return {
        isValid: true,
        detectedMime: 'application/pdf',
        declaredExtension,
      };
    }
    return {
      isValid: false,
      detectedMime: 'application/octet-stream',
      declaredExtension,
      error: 'Invalid PDF file: Missing standard %PDF- binary header.',
    };
  }

  // 4. Validate ZIP-based formats (DOCX, PPTX, EPUB, ZIP)
  if (['.docx', '.pptx', '.epub', '.zip'].includes(declaredExtension)) {
    if (buffer.length >= 4 && buffer.subarray(0, 4).equals(ZIP_MAGIC)) {
      return {
        isValid: true,
        detectedMime: EXTENSION_TO_MIME[declaredExtension] || 'application/zip',
        declaredExtension,
      };
    }
    return {
      isValid: false,
      detectedMime: 'application/octet-stream',
      declaredExtension,
      error: `Invalid ${declaredExtension.toUpperCase()} file: Missing standard PK\\x03\\x04 archive header.`,
    };
  }

  // 5. Validate MP4 video files
  if (declaredExtension === '.mp4') {
    if (buffer.length >= 8) {
      const ftyp = buffer.subarray(4, 8).toString('ascii');
      if (ftyp === 'ftyp') {
        return {
          isValid: true,
          detectedMime: 'video/mp4',
          declaredExtension,
        };
      }
    }
    return {
      isValid: false,
      detectedMime: 'application/octet-stream',
      declaredExtension,
      error: 'Invalid MP4 file: Missing ftyp video box signature.',
    };
  }

  // 6. Validate Plain Text (.txt)
  if (declaredExtension === '.txt') {
    // Check for null bytes (binary files pretending to be text)
    const scanLimit = Math.min(buffer.length, 1024);
    for (let i = 0; i < scanLimit; i++) {
      if (buffer[i] === 0x00) {
        return {
          isValid: false,
          detectedMime: 'application/octet-stream',
          declaredExtension,
          error: 'Binary control characters detected in text document.',
        };
      }
    }
    return {
      isValid: true,
      detectedMime: 'text/plain',
      declaredExtension,
    };
  }

  // Unrecognized or disallowed extension
  return {
    isValid: false,
    detectedMime: 'application/octet-stream',
    declaredExtension,
    error: `Unsupported document format "${declaredExtension}". Allowed: .pdf, .docx, .pptx, .epub, .zip, .txt, .mp4`,
  };
}
