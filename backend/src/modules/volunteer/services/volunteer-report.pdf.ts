import { join } from 'path';
import { format } from 'date-fns';
import PDFDocument = require('pdfkit');

export interface IVolunteerReportLog {
  date: Date | string;
  hours: number;
  status: string;
  activity: string | null;
  event: string | null;
}

export interface IVolunteerReportEvent {
  name: string;
  startDate: Date | string;
  endDate: Date | string | null;
  location: string | null;
  hours: number;
}

export interface IVolunteerReportData {
  organization: string;
  generatedOn: Date;
  profile: { label: string; value: string }[];
  stats: { label: string; value: string }[];
  activities: { name: string; hours: number; entries: number }[];
  logs: IVolunteerReportLog[];
  upcomingEvents: IVolunteerReportEvent[];
  finishedEvents: IVolunteerReportEvent[];
}

const ASSETS = join(__dirname, '..', 'assets');
const LOGO = join(__dirname, '..', '..', 'mail', 'assets', 'vic-logo.png');
const FONT = join(ASSETS, 'fonts', 'Roboto-Regular.ttf');
const FONT_BOLD = join(ASSETS, 'fonts', 'Roboto-Bold.ttf');

const NAVY = '#1f2a44';
const MUTED = '#6b7280';
const LINE = '#e5e7eb';

export const reportDate = (date: Date | string | null): string =>
  date ? format(new Date(date), 'dd.MM.yyyy') : '-';

interface Column<T> {
  header: string;
  width: number;
  value: (row: T) => string;
  align?: 'left' | 'right';
}

// #479: the volunteer's full report, A4, with Roboto so Romanian diacritics render.
export const renderVolunteerReport = (
  data: IVolunteerReportData,
): Promise<Buffer> =>
  new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
      info: { Title: 'Raport voluntar', Producer: 'VIC' },
      bufferPages: true,
    });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.registerFont('regular', FONT);
    doc.registerFont('bold', FONT_BOLD);
    const left = doc.page.margins.left;
    const width = doc.page.width - left - doc.page.margins.right;
    const bottom = (): number => doc.page.height - doc.page.margins.bottom;

    const ensureSpace = (height: number): void => {
      if (doc.y + height > bottom()) doc.addPage();
    };

    const heading = (text: string): void => {
      // keep the heading with a table header and its first row
      ensureSpace(90);
      doc.moveDown(1.2);
      doc.font('bold').fontSize(13).fillColor(NAVY).text(text, left, doc.y);
      doc.moveDown(0.4);
    };

    const empty = (text: string): PDFKit.PDFDocument =>
      doc.font('regular').fontSize(10).fillColor(MUTED).text(text, left);

    const table = <T>(columns: Column<T>[], rows: T[]): void => {
      const drawRow = (cells: string[], bold: boolean): void => {
        doc.font(bold ? 'bold' : 'regular').fontSize(9);
        const height =
          Math.max(
            ...cells.map((cell, i) =>
              doc.heightOfString(cell, { width: columns[i].width - 6 }),
            ),
          ) + 8;
        if (doc.y + height > bottom()) {
          doc.addPage();
          if (!bold)
            drawRow(
              columns.map((c) => c.header),
              true,
            );
          // the repeated header leaves the bold font set
          doc.font(bold ? 'bold' : 'regular').fontSize(9);
        }
        const y = doc.y;
        let x = left;
        cells.forEach((cell, i) => {
          doc.fillColor(bold ? MUTED : '#111827').text(cell, x + 3, y + 4, {
            width: columns[i].width - 6,
            align: columns[i].align ?? 'left',
          });
          x += columns[i].width;
        });
        doc
          .moveTo(left, y + height)
          .lineTo(left + width, y + height)
          .strokeColor(LINE)
          .lineWidth(0.5)
          .stroke();
        doc.x = left;
        doc.y = y + height;
      };
      drawRow(
        columns.map((c) => c.header),
        true,
      );
      rows.forEach((row) =>
        drawRow(
          columns.map((c) => c.value(row)),
          false,
        ),
      );
    };

    const pairs = (items: { label: string; value: string }[]): void => {
      const labelWidth = 150;
      items.forEach(({ label, value }) => {
        doc.font('regular').fontSize(10);
        const height =
          Math.max(
            doc.heightOfString(label, { width: labelWidth }),
            doc.heightOfString(value || '-', { width: width - labelWidth }),
          ) + 4;
        ensureSpace(height);
        const y = doc.y;
        doc.fillColor(MUTED).text(label, left, y, { width: labelWidth });
        doc.fillColor('#111827').text(value || '-', left + labelWidth, y, {
          width: width - labelWidth,
        });
        doc.y = y + height;
      });
    };

    // header
    try {
      doc.image(LOGO, left, 40, { height: 32 });
    } catch {
      // the report is still useful without the logo
    }
    doc
      .font('regular')
      .fontSize(9)
      .fillColor(MUTED)
      .text(`Generat la ${reportDate(data.generatedOn)}`, left, 50, {
        width,
        align: 'right',
      });
    doc.y = 90;
    doc
      .font('bold')
      .fontSize(20)
      .fillColor(NAVY)
      .text('Raport voluntar', left, doc.y);
    doc.font('regular').fontSize(11).fillColor(MUTED).text(data.organization);

    heading('Date profil');
    pairs(data.profile);

    heading('Pe scurt');
    pairs(data.stats);

    heading('Activități');
    if (data.activities.length) {
      table<IVolunteerReportData['activities'][number]>(
        [
          {
            header: 'Tip activitate',
            width: width - 160,
            value: (a): string => a.name,
          },
          {
            header: 'Înregistrări',
            width: 80,
            value: (a): string => `${a.entries}`,
            align: 'right',
          },
          {
            header: 'Ore aprobate',
            width: 80,
            value: (a): string => `${a.hours}`,
            align: 'right',
          },
        ],
        data.activities,
      );
    } else empty('Nicio activitate înregistrată.');

    const STATUS: Record<string, string> = {
      pending: 'În așteptare',
      approved: 'Aprobată',
      rejected: 'Respinsă',
    };
    heading('Istoric ore');
    if (data.logs.length) {
      table<IVolunteerReportLog>(
        [
          {
            header: 'Data',
            width: 70,
            value: (l): string => reportDate(l.date),
          },
          {
            header: 'Activitate',
            width: (width - 190) / 2,
            value: (l): string => l.activity || '-',
          },
          {
            header: 'Eveniment',
            width: (width - 190) / 2,
            value: (l): string => l.event || '-',
          },
          {
            header: 'Ore',
            width: 40,
            value: (l): string => `${l.hours}`,
            align: 'right',
          },
          {
            header: 'Status',
            width: 80,
            value: (l): string => STATUS[l.status] ?? l.status,
          },
        ],
        data.logs,
      );
    } else empty('Nicio oră înregistrată.');

    const eventColumns: Column<IVolunteerReportEvent>[] = [
      { header: 'Eveniment', width: width - 300, value: (e): string => e.name },
      {
        header: 'Perioada',
        width: 130,
        value: (e): string =>
          e.endDate
            ? `${reportDate(e.startDate)} – ${reportDate(e.endDate)}`
            : reportDate(e.startDate),
      },
      {
        header: 'Locație',
        width: 120,
        value: (e): string => e.location || '-',
      },
      {
        header: 'Ore',
        width: 50,
        value: (e): string => `${e.hours}`,
        align: 'right',
      },
    ];
    heading('Evenimente viitoare');
    if (data.upcomingEvents.length) table(eventColumns, data.upcomingEvents);
    else empty('Niciun eveniment viitor.');
    heading('Evenimente încheiate');
    if (data.finishedEvents.length) table(eventColumns, data.finishedEvents);
    else empty('Niciun eveniment încheiat.');

    // page numbers
    const range = doc.bufferedPageRange();
    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i);
      const margin = doc.page.margins.bottom;
      doc.page.margins.bottom = 0;
      doc
        .font('regular')
        .fontSize(8)
        .fillColor(MUTED)
        .text(
          `VIC · ${data.organization} · pagina ${i + 1} din ${range.count}`,
          left,
          doc.page.height - 35,
          { width, align: 'center' },
        );
      doc.page.margins.bottom = margin;
    }
    doc.end();
  });
