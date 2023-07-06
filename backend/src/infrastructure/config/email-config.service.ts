import { MailerOptions } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

@Injectable()
export class EmailConfigService {
  constructor(private readonly configService: ConfigService) {}

  createMailerOptions(): MailerOptions {
    return {
      transport: {
        host: this.configService.get('MAIL_HOST'),
        port: +this.configService.get('MAIL_PORT'),
        ignoreTLS: true,
        secure: false,
        auth: {
          user: this.configService.get('MAIL_USER'),
          pass: this.configService.get('MAIL_PASS'),
        },
      },
      defaults: {
        from: '"No Reply" <no-reply@localhost>',
      },
      preview: true,
      template: {
        dir: __dirname + '/../../modules/mail/templates',
        adapter: new HandlebarsAdapter({ asset_url: this.createAssetUrl }),
        options: {
          strict: true,
        },
      },
      options: {
        partials: {
          dir: __dirname + '/../../modules/mail/templates/' + 'partials',
          options: {
            strict: true,
          },
        },
      },
    };
  }

  createAssetUrl = (assetName: string): string => {
    return `${this.configService.get('AWS_S3_BUCKET_NAME')}/mail/${assetName}`;
  };
}
