import { Controller, Get } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { APP_VERSION } from 'src/common/constants/version';
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
  async pdf(): Promise<unknown> {
    return this.generatePDFsUseCase.execute();
  }
}
