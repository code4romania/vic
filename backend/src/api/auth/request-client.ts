import { Request } from 'express';
import { SessionClient } from 'src/modules/auth/services/session.service';
import { Language } from 'src/modules/user/enums/user.enum';

// Stored on the session row: which browser or phone, from where. req.ip honours `trust proxy`.
export function requestClient(req: Request): SessionClient {
  return {
    userAgent: req.headers['user-agent']?.slice(0, 512),
    ip: req.ip,
  };
}

// The language of the app screen the request came from. The apps send exactly `Accept-Language: ro` or
// `en`; anything else (a browser's or a phone's own list, "en-US,en;q=0.9", from an app version that
// does not know about languages) counts as unknown.
export function requestLanguage(req: Request): Language | null {
  const header = req.headers['accept-language'];
  const value = (Array.isArray(header) ? header[0] : header)
    ?.trim()
    .toLowerCase();
  return value === Language.RO || value === Language.EN ? value : null;
}
