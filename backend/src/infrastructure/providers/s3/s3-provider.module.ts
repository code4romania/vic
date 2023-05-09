import { Module } from '@nestjs/common';
import { S3ConfigService } from 'src/infrastructure/config/s3.config';
import { S3Module } from './module/s3.module';

@Module({
  imports: [
    S3Module.registerAsync({
      useClass: S3ConfigService,
    }),
  ],
})
export class S3ProviderModule {}
