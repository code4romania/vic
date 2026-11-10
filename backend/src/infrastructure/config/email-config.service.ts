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
        ignoreTLS: false, // - if this is true and secure is false then TLS is not used even if the server supports STARTTLS extension
        secure: false, // – if true the connection will use TLS when connecting to server. If false (the default) then TLS is used if server supports the STARTTLS extension. In most cases set this value to true if you are connecting to port 465. For port 587 or 25 keep it false
        auth: {
          user: this.configService.get('MAIL_USER'),
          pass: this.configService.get('MAIL_PASS'),
        },
      },
      defaults: {
        // Required in staging and production (environment-config.ts); a local default otherwise.
        from: this.configService.get('MAIL_FROM'),
      },
      // Opens each email in the browser. Not in the iOS Simulator: on a Mac with Xcode but no booted
      // simulator, preview-email polls `simctl` forever and the mail queue stops. preview-email accepts
      // `openSimulator`; the mailer's type for `preview` does not list it, hence the cast.
      preview: { openSimulator: false } as MailerOptions['preview'],
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
    return `https://${this.configService.get(
      'AWS_S3_BUCKET_NAME_PUBLIC',
    )}/${assetName}`;
  };
}
