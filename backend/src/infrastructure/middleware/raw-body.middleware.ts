import { Injectable, NestMiddleware } from '@nestjs/common';
import { json } from 'body-parser';
import { NextFunction, Request, Response } from 'express';
import { IncomingMessage, ServerResponse } from 'http';

type RequestWithRawBody = IncomingMessage & { rawBody?: Buffer };

/**
 * Copied this middleware to parse the raw response into a param to use later
 * from https://github.com/golevelup/nestjs/blob/master/packages/webhooks/src/webhooks.middleware.ts
 */
@Injectable()
export class RawBodyMiddleware implements NestMiddleware {
  public use(req: Request, res: Response, next: NextFunction): void {
    json({
      verify: (
        request: RequestWithRawBody,
        _response: ServerResponse,
        buffer: Buffer,
      ): void => {
        if (Buffer.isBuffer(buffer)) {
          request.rawBody = Buffer.from(buffer);
        }
      },
    })(req, res, next);
  }
}
