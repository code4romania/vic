import { Controller, Get, Res } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { APP_VERSION } from 'src/common/constants/version';
import { Response } from 'express';
import { GeneratePDFsUseCase } from 'src/usecases/documents/generate-pdfs.usecase';

@Controller('public')
export class PublicController {
  constructor(private readonly generatePDFsUseCase: GeneratePDFsUseCase) {}

  @SkipThrottle()
  @Get('health')
  healthCheck(): 'OK' {
    return 'OK';
  }

  @SkipThrottle()
  @Get('version')
  version(): unknown {
    return APP_VERSION;
  }

  @Get('pdf')
  async pdf(@Res() res: Response): Promise<void> {
    const buffer = await this.generatePDFsUseCase.execute();
    res.set({
      // pdf
      'Content-Type': 'application/pdf',
      // 'Content-Disposition': 'attachment; filename=invoice.pdf',
      'Content-Disposition': 'inline; filename=invoice.pdf',
      'Content-Length': buffer.length,
      // prevent cache
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
      Expires: 0,
    });
    res.end(buffer);
  }
}
