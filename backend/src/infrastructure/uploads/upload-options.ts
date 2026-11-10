import { BadRequestException } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { IError } from 'src/common/exceptions/exceptions.interface';

export const PDF_MAX_BYTES = 10 * 1024 * 1024;
// Photos straight from a phone's gallery (the app sends them at full quality).
export const PROFILE_PICTURE_MAX_BYTES = 10 * 1024 * 1024;

export const PDF_MIMETYPES = ['application/pdf'];
export const PROFILE_PICTURE_MIMETYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
];

// Multer options for one uploaded file: bigger than maxBytes is a 413 FILE_TOO_LARGE (the exception
// filter adds the code) before the rest is read into memory, and a type not in mimetypes is a 400 with
// the given error. The use case still checks the content.
export function singleFileUpload(options: {
  maxBytes: number;
  mimetypes: string[];
  invalidType: IError;
}): MulterOptions {
  return {
    limits: { fileSize: options.maxBytes, files: 1 },
    fileFilter: (_req, file, callback): void => {
      if (options.mimetypes.includes(file.mimetype)) {
        callback(null, true);
      } else {
        callback(new BadRequestException(options.invalidType), false);
      }
    },
  };
}

// The first bytes of the image types a profile picture may be. The app labels every photo image/jpeg,
// so the content is checked against all of them, not only the declared one.
export function isImage(buffer?: Buffer): boolean {
  if (!buffer || buffer.length < 12) return false;
  const ascii = (from: number, to: number): string =>
    buffer.subarray(from, to).toString('latin1');
  return (
    buffer
      .subarray(0, 8)
      .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) ||
    buffer.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff])) ||
    (ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WEBP') ||
    (ascii(4, 8) === 'ftyp' &&
      ['heic', 'heix', 'hevc', 'hevx', 'mif1', 'msf1', 'heim', 'heis'].includes(
        ascii(8, 12),
      ))
  );
}
