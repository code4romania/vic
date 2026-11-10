import { ExpressAdapter } from '@bull-board/express';
import { Logger, INestApplication } from '@nestjs/common';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { createBullBoard } from '@bull-board/api';
import { Queue } from 'bull';
import { createHash, timingSafeEqual } from 'crypto';
import { NextFunction, Request, Response } from 'express';
import { QUEUES, QUEUES_TYPES } from 'src/common/constants/constants';

export const BULL_BOARD_PATH = '/admin/queues';

export interface BullBoardSettings {
  enabled: boolean;
  user?: string;
  password?: string;
}

// The board shows every job's data: the emails waiting in the queues carry login links and codes.
// Off unless BULL_BOARD_ENABLED=true, and then only behind basic auth (BULL_BOARD_USER / BULL_BOARD_PASSWORD).
export function bullBoardSettings(
  env: NodeJS.ProcessEnv = process.env,
): BullBoardSettings {
  return {
    enabled: env.BULL_BOARD_ENABLED === 'true',
    user: env.BULL_BOARD_USER,
    password: env.BULL_BOARD_PASSWORD,
  };
}

// Mounts the board at /admin/queues when enabled and both credentials are set; otherwise the path is a 404.
export function mountQueueMonitoring(
  app: INestApplication,
  settings: BullBoardSettings = bullBoardSettings(),
): boolean {
  const logger = new Logger('QueueMonitoring');
  if (!settings.enabled) return false;
  if (!settings.user || !settings.password) {
    logger.warn(
      'BULL_BOARD_ENABLED is true but BULL_BOARD_USER or BULL_BOARD_PASSWORD is missing: the board is not mounted',
    );
    return false;
  }

  const adapter = createQueueMonitoring(app);
  if (!adapter) return false;

  app.use(
    BULL_BOARD_PATH,
    basicAuth(settings.user, settings.password),
    adapter.getRouter(),
  );
  return true;
}

export function createQueueMonitoring(app: INestApplication): ExpressAdapter {
  try {
    const serverAdapter = new ExpressAdapter();
    serverAdapter.setBasePath(BULL_BOARD_PATH);

    createBullBoard({
      queues: [
        ...Object.keys(QUEUES).map((QUEUE: QUEUES_TYPES) => {
          const instance = app.get<Queue>(`BullQueue_${QUEUES[QUEUE]}`);
          return new BullAdapter(instance);
        }),
      ],
      serverAdapter: serverAdapter,
    });

    return serverAdapter;
  } catch (err) {
    new Logger('QueueMonitoring').error(
      'BullBoard could not be initialized',
      err?.stack,
    );
    return null;
  }
}

// Compares digests so neither the length nor the content of the credentials leaks through timing.
function basicAuth(
  user: string,
  password: string,
): (req: Request, res: Response, next: NextFunction) => void {
  const digest = (value: string | Buffer): Buffer =>
    createHash('sha256').update(value).digest();
  const expected = digest(`${user}:${password}`);

  return (req, res, next) => {
    const [scheme, encoded] = (req.headers.authorization ?? '').split(' ');
    const given =
      scheme?.toLowerCase() === 'basic' && encoded
        ? Buffer.from(encoded, 'base64')
        : Buffer.alloc(0);
    if (timingSafeEqual(digest(given), expected)) {
      next();
      return;
    }
    res.set('WWW-Authenticate', 'Basic realm="queues", charset="UTF-8"');
    res.status(401).end();
  };
}
