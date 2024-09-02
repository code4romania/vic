import { Injectable } from '@nestjs/common';
import { resolve } from 'path';
import * as fs from 'fs';
import Handlebars from 'handlebars';
import axios from 'axios';

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

  public async generatePDF(): Promise<unknown> {
    const templateDir = resolve(__dirname, '..', 'templates', 'contract.hbs');
    const file = fs.readFileSync(templateDir, 'utf-8');
    const template = Handlebars.compile(file);
    const fileHTML = template({
      title: 'dadsa',
      subtitle: `<h5 style="color:blue;text-align:center;">Text</h5>`,
    });

    // return HTMLtoPDF(fileHTML);
    return axios
      .post(
        'https://iywe2rp7u1.execute-api.us-east-1.amazonaws.com/test',
        fileHTML,
      )
      .then((res) => res.data);
  }
}
