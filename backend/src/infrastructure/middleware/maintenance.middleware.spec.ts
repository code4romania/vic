import { Request, Response } from 'express';
import { createTestAuthConfig } from '../../../test/utils/auth-test-config';
import { MaintenanceMiddleware } from './maintenance.middleware';

describe('MaintenanceMiddleware', () => {
  const middleware = (mode: string, allowed = ''): MaintenanceMiddleware =>
    new MaintenanceMiddleware(
      createTestAuthConfig({
        MAINTENANCE_MODE: mode,
        MAINTENANCE_ALLOWED_IPS: allowed,
      }),
    );

  const run = (
    subject: MaintenanceMiddleware,
    request: Partial<Request>,
  ): { next: jest.Mock; status: jest.Mock; json: jest.Mock } => {
    const next = jest.fn();
    const json = jest.fn();
    const status = jest.fn().mockReturnValue({ json });
    subject.use(
      {
        method: 'GET',
        originalUrl: '/organization',
        ip: '1.1.1.1',
        ...request,
      } as Request,
      { status } as unknown as Response,
      next,
    );
    return { next, status, json };
  };

  it('passes everything when maintenance is off', () => {
    const { next, status } = run(middleware('false'), {});

    expect(next).toHaveBeenCalled();
    expect(status).not.toHaveBeenCalled();
  });

  it('answers 503 MAINTENANCE when on', () => {
    const { next, status, json } = run(middleware('true'), {
      method: 'POST',
      originalUrl: '/auth/web/login',
    });

    expect(next).not.toHaveBeenCalled();
    expect(status).toHaveBeenCalledWith(503);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ code_error: 'MAINTENANCE' }),
    );
  });

  it('lets GET /public/health through, with or without a query string', () => {
    expect(
      run(middleware('true'), { originalUrl: '/public/health' }).next,
    ).toHaveBeenCalled();
    expect(
      run(middleware('true'), { originalUrl: '/public/health?x=1' }).next,
    ).toHaveBeenCalled();
    expect(
      run(middleware('true'), { method: 'POST', originalUrl: '/public/health' })
        .next,
    ).not.toHaveBeenCalled();
  });

  it('lets an allow-listed client IP through, IPv4-mapped IPv6 included', () => {
    const subject = middleware('true', '203.0.113.7, 198.51.100.2');

    expect(run(subject, { ip: '203.0.113.7' }).next).toHaveBeenCalled();
    expect(run(subject, { ip: '::ffff:198.51.100.2' }).next).toHaveBeenCalled();
    expect(run(subject, { ip: '203.0.113.8' }).next).not.toHaveBeenCalled();
  });
});
