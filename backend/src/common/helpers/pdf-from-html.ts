import puppeteer from 'puppeteer';

export const HTMLtoPDF = async (html: string): Promise<Uint8Array> => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.setContent(html);
  const buffer = await page.pdf({ format: 'A4' });
  await browser.close();

  return buffer;
};
