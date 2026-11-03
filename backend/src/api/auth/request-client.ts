import { Request } from 'express';
import { SessionClient } from 'src/modules/auth/services/session.service';

// Stored on the session row: which browser or phone, from where. req.ip honours `trust proxy`.
export function requestClient(req: Request): SessionClient {
  return {
    userAgent: req.headers['user-agent']?.slice(0, 512),
    ip: req.ip,
  };
}
