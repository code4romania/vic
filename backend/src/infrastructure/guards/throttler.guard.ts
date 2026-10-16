import { ThrottlerGuard } from '@nestjs/throttler';
import { Injectable } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class ThrottlerGuardByIP extends ThrottlerGuard {
  protected async getTracker(req: Request): Promise<string> {
    return req.ips.length ? req.ips[0] : req.ip;
  }
}
