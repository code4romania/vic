import { join } from 'path';
import { format } from 'date-fns';
import PDFDocument = require('pdfkit');

export interface ICertificateData {
  organization: {
    name: string;
    taxId: string | null;
    address: string | null;
    email: string | null;
    phone: string | null;
  };
  registrationNumber: string;
  issueDate: Date;
  volunteerName: string;
  since: Date | null;
  until: Date;
  hours: number;
  purpose: string;
}

const ASSETS = join(__dirname, '..', '..', 'volunteer', 'assets');
const FONT = join(ASSETS, 'fonts', 'Roboto-Regular.ttf');
const FONT_BOLD = join(ASSETS, 'fonts', 'Roboto-Bold.ttf');

const NAVY = '#1f2a44';
const MUTED = '#6b7280';
const TEXT = '#111827';

const day = (date: Date): string => format(new Date(date), 'dd.MM.yyyy');

// 12 -> "12", 12.5 -> "12,5"
export const formatHours = (hours: number): string =>
  `${Math.round(hours * 100) / 100}`.replace('.', ',');

// #490: the standard certificate ("adeverință de voluntariat"), A4, Roboto for diacritics. The NGO
// prints it, signs and stamps it, then uploads the signed copy as a document of the volunteer.
export const renderCertificate = (data: ICertificateData): Promise<Buffer> =>
  new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margin: 60,
      info: { Title: 'Adeverință de voluntariat', Producer: 'VIC' },
    });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.registerFont('regular', FONT);
    doc.registerFont('bold', FONT_BOLD);
    const left = doc.page.margins.left;
    const width = doc.page.width - left - doc.page.margins.right;
    const { organization } = data;

    // letterhead
    doc
      .font('bold')
      .fontSize(13)
      .fillColor(NAVY)
      .text(organization.name, left, 60, {
        width,
      });
    doc.font('regular').fontSize(9).fillColor(MUTED);
    [
      organization.taxId ? `CUI: ${organization.taxId}` : null,
      organization.address,
      [organization.email, organization.phone].filter(Boolean).join(' · ') ||
        null,
    ]
      .filter(Boolean)
      .forEach((line) => doc.text(line, { width }));
    doc
      .moveTo(left, doc.y + 8)
      .lineTo(left + width, doc.y + 8)
      .strokeColor('#e5e7eb')
      .lineWidth(0.8)
      .stroke();

    doc.y += 22;
    doc
      .font('regular')
      .fontSize(10)
      .fillColor(TEXT)
      .text(
        `Nr. ${data.registrationNumber} / ${day(data.issueDate)}`,
        left,
        doc.y,
        { width },
      );

    doc.moveDown(3);
    doc
      .font('bold')
      .fontSize(18)
      .fillColor(NAVY)
      .text('ADEVERINȚĂ', left, doc.y, { width, align: 'center' });
    doc.moveDown(2);

    const period = data.since
      ? `în perioada ${day(data.since)} – ${day(data.until)}`
      : `până la data de ${day(data.until)}`;
    const paragraph = (parts: { text: string; bold?: boolean }[]): void => {
      parts.forEach((part, i) =>
        doc
          .font(part.bold ? 'bold' : 'regular')
          .fontSize(11.5)
          .fillColor(TEXT)
          .text(part.text, {
            width,
            align: 'left',
            lineGap: 5,
            indent: i === 0 ? 30 : 0,
            continued: i < parts.length - 1,
          }),
      );
      doc.moveDown(1);
    };

    paragraph([
      { text: 'Prin prezenta se adeverește că ' },
      { text: data.volunteerName, bold: true },
      { text: ' a desfășurat activități de voluntariat în cadrul ' },
      { text: organization.name, bold: true },
      {
        text: `${organization.taxId ? ` (CUI ${organization.taxId})` : ''}, ${period}, totalizând `,
      },
      { text: `${formatHours(data.hours)} ore`, bold: true },
      {
        text: ' de activitate, în baza contractului de voluntariat încheiat conform Legii nr. 78/2014 privind reglementarea activității de voluntariat în România.',
      },
    ]);
    paragraph([
      { text: 'Prezenta adeverință se eliberează pentru a-i servi la: ' },
      { text: data.purpose, bold: true },
      { text: '.' },
    ]);

    // signatures
    doc.moveDown(4);
    const y = doc.y;
    const half = width / 2;
    doc
      .font('bold')
      .fontSize(10.5)
      .fillColor(TEXT)
      .text('Reprezentant legal,', left, y, { width: half - 20 })
      .text('Coordonator voluntari,', left + half + 20, y, {
        width: half - 20,
        align: 'right',
      });
    doc
      .font('regular')
      .fontSize(9)
      .fillColor(MUTED)
      .text('Nume, semnătură și ștampilă', left, y + 40, { width: half - 20 })
      .text('Nume și semnătură', left + half + 20, y + 40, {
        width: half - 20,
        align: 'right',
      });

    doc.end();
  });
