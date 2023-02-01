import { Request } from 'express';

export const PinoLoggerConfig = {
  pinoHttp: {
    level: 'trace',
    autoLogging: {
      ignore: (req: Request): boolean => {
        return req.url.includes('health');
      },
    },
  },
};
