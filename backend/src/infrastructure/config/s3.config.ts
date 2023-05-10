import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3ModuleOptions } from '../providers/s3/module/s3.interfaces';

@Injectable()
export class S3ConfigService {
  constructor(private configService: ConfigService) {}

  createS3ConfigOptions(): S3ModuleOptions {
    return {
      accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
      region: this.configService.get('AWS_REGION'),
      defaultBucket: this.configService.get('AWS_S3_DEFAULT_BUCKET'),
    };
  }
}
