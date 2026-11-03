import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3ModuleOptions } from '../providers/s3/module/s3.interfaces';

@Injectable()
export class S3ConfigService {
  constructor(private configService: ConfigService) {}

  createS3ConfigOptions(): S3ModuleOptions {
    // AWS_S3_BUCKET_NAME_PUBLIC holds the public bucket's host, <bucket>.s3.<region>.amazonaws.com
    // (the email templates build image links from it). Logos go to that bucket and are served from it.
    const publicHost: string =
      this.configService.get('AWS_S3_BUCKET_NAME_PUBLIC') ?? '';

    return {
      accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
      region: this.configService.get('AWS_REGION'),
      defaultBucket: this.configService.get('AWS_S3_BUCKET_NAME'),
      // The three below are for a local S3 emulator; staging and production leave them unset.
      endpoint: this.configService.get('AWS_S3_ENDPOINT') || undefined,
      publicBucket:
        this.configService.get('AWS_S3_PUBLIC_BUCKET') ||
        publicHost.split('.s3')[0] ||
        undefined,
      publicBaseUrl:
        this.configService.get('AWS_S3_PUBLIC_BASE_URL') ||
        (publicHost ? `https://${publicHost}` : undefined),
    };
  }
}
