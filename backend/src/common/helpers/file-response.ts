import { StreamableFile } from '@nestjs/common';
import { Response } from 'express';
import { Readable } from 'stream';

const CONTENT_TYPES: Record<string, string> = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

// Uploads are stored without a content type, so the type comes from the stored key's extension.
export const contentTypeFor = (key: string): string =>
  CONTENT_TYPES[key.split('.').pop()?.toLowerCase() ?? ''] ??
  'application/octet-stream';

// RFC 6266 / 5987: an ASCII fallback for old clients plus the exact UTF-8 name, so names with
// diacritics or quotes ("Model voluntariat – școală") survive.
export const contentDisposition = (
  fileName: string,
  disposition: 'inline' | 'attachment',
): string => {
  const ascii = fileName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\x20-\x7e]/g, '_')
    .replace(/["\\]/g, '_');
  const encoded = encodeURIComponent(fileName).replace(
    /['()*]/g,
    (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`,
  );
  return `${disposition}; filename="${ascii}"; filename*=UTF-8''${encoded}`;
};

export interface IStoredFile {
  body: Readable;
  contentLength?: number;
  fileName: string;
  contentType: string;
}

// #724: a document file for the in-app viewer (inline) or the Download button (?download=true).
export const sendStoredFile = (
  res: Response,
  file: IStoredFile,
  download: boolean,
): StreamableFile => {
  res.set({
    'Content-Type': file.contentType,
    'Content-Disposition': contentDisposition(
      file.fileName,
      download ? 'attachment' : 'inline',
    ),
    'Cache-Control': 'private, no-store',
    'Access-Control-Expose-Headers': 'Content-Disposition',
  });
  return new StreamableFile(file.body, {
    type: file.contentType,
    length: file.contentLength,
  });
};
