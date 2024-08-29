import { Injectable } from '@nestjs/common';
import { resolve } from 'path';
import * as fs from 'fs';
import { HTMLtoPDF } from 'src/common/helpers/pdf-from-html';
import Handlebars from 'handlebars';

@Injectable()
export class PDFGenerator {
  constructor() {
    // TODO: This should be handled using a HandlebarsAdapter, similar to MailerModule to register partials/helpers/etc
    const templateDir = resolve(
      __dirname,
      '..',
      'templates/partials',
      'header.hbs',
    );
    const file = fs.readFileSync(templateDir, 'utf-8');
    const template = Handlebars.compile(file);
    Handlebars.registerPartial('header', template);
  }

  public async generatePDF(): Promise<Uint8Array> {
    const templateDir = resolve(__dirname, '..', 'templates', 'contract.hbs');
    const file = fs.readFileSync(templateDir, 'utf-8');
    const template = Handlebars.compile(file);
    const fileHTML = template({
      title: 'dadsa',
      subtitle: `<h5 style="color:blue;text-align:center;">Text</h5>`,
    });

    return HTMLtoPDF(fileHTML);
  }
}
