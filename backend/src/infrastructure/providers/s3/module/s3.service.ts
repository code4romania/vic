import { Inject, Injectable, Logger } from '@nestjs/common';
import { MODULE_OPTIONS_TOKEN } from './s3.module-definition';
import { S3ModuleOptions } from './s3.interfaces';
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { FILE_URL_EXPIRATION_TIME } from './s3.constants';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuid } from 'uuid';

@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);
  private readonly s3: S3Client;

  constructor(@Inject(MODULE_OPTIONS_TOKEN) private options: S3ModuleOptions) {
    this.s3 = new S3Client({
      credentials: {
        accessKeyId: this.options.accessKeyId,
        secretAccessKey: this.options.secretAccessKey,
      },
      region: this.options.region,
      ...(this.options.endpoint
        ? { endpoint: this.options.endpoint, forcePathStyle: true }
        : {}),
    });
  }

  public async generatePresignedURL(
    fileName: string,
    bucket?: string,
  ): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: bucket || this.options.defaultBucket,
      Key: fileName,
    });

    return getSignedUrl(this.s3, command, {
      expiresIn: FILE_URL_EXPIRATION_TIME,
    });
  }

  public async uploadFile(
    path: string,
    file: Express.Multer.File,
    fileName?: string,
    bucket?: string,
  ): Promise<string> {
    // Create upload params
    const uploadCommand: PutObjectCommand = new PutObjectCommand({
      Body: file.buffer,
      Bucket: bucket || this.options.defaultBucket,
      Key: `${path}/${uuid()}-${fileName || file.originalname}`,
    });

    // Upload
    try {
      await this.s3.send(uploadCommand);
    } catch (error) {
      this.logger.error('Error uploading file to S3: ', error);
      throw error;
    }

    // Return uploaded files paths
    return uploadCommand.input.Key;
  }

  // For files anyone may see (NGO logos): uploaded to the public bucket; returns the full URL, which is
  // what gets stored, so new logos look like the legacy NGO Hub logo URLs and need no presigning.
  public async uploadPublicFile(
    path: string,
    file: Express.Multer.File,
    fileName?: string,
  ): Promise<string> {
    if (!this.options.publicBucket || !this.options.publicBaseUrl) {
      throw new Error('The public S3 bucket is not configured');
    }
    const key = await this.uploadFile(
      path,
      file,
      fileName,
      this.options.publicBucket,
    );
    return `${this.options.publicBaseUrl.replace(/\/+$/, '')}/${key}`;
  }

  // Deletes a file uploaded with uploadPublicFile, given the URL it returned. A URL outside the public
  // bucket (a legacy NGO Hub logo) is left alone; returns the deleted key, or null.
  public async deletePublicFile(url: string): Promise<string> {
    const base = this.options.publicBaseUrl?.replace(/\/+$/, '');
    if (!url || !base || !this.options.publicBucket) return null;
    if (!url.startsWith(`${base}/`)) return null;

    return this.deleteFile(
      url.slice(base.length + 1),
      this.options.publicBucket,
    );
  }

  public async deleteFile(key: string, bucket?: string): Promise<string> {
    const deleteCommand: DeleteObjectCommand = new DeleteObjectCommand({
      Bucket: bucket || this.options.defaultBucket,
      Key: key,
    });

    try {
      await this.s3.send(deleteCommand);
    } catch (error) {
      this.logger.error('Error deleting file from S3: ', error);
      throw error;
    }

    return deleteCommand.input.Key;
  }
}
