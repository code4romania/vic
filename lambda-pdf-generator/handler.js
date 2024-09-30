const puppeteer = require("puppeteer-core");
const chromium = require("@sparticuz/chromium");
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");

const s3 = new S3Client({ region: 'eu-west-1' });
const S3_BUCKET = 'vic-staging-private-enid';

chromium.setHeadlessMode = true;

exports.generatePDF = async (event) => {
  console.log('Received headers:', event.headers);

  const {
    'x-document-contract-id': documentContractId,
    'x-organization-id': organizationId,
    'x-existing-file-path': existingContractFilePath
  } = event.headers;

  if (!documentContractId || !organizationId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Missing required headers' }),
    };
  }

  try {
    const browser = await puppeteer.launch({
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
      args: [...chromium.args, "--hide-scrollbars", "--disable-web-security", '--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setContent(event.body);
    const buffer = await page.pdf({ format: 'A4', margin: { top: '50px', bottom: '50px' } });
    await browser.close();

    const fileName = `documents/contracts/${organizationId}/${documentContractId}-${Date.now()}.pdf`;
    const s3Params = {
      Bucket: S3_BUCKET,
      Key: fileName,
      Body: buffer,
      ContentType: 'application/pdf',
    };

    await s3.send(new PutObjectCommand(s3Params));

    if (existingContractFilePath) {
      try {
        await s3.send(new DeleteObjectCommand({
          Bucket: S3_BUCKET,
          Key: existingContractFilePath,
        }));
      } catch (error) {
        console.error('Error deleting existing PDF from S3:', error);
        // TODO: Log this error to Sentry
      }
    }

    console.log(`PDF uploaded successfully: https://${s3Params.Bucket}.s3.amazonaws.com/${s3Params.Key}`);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'PDF successfully uploaded to S3',
        url: s3Params.Key,
      }),
    };
  } catch (error) {
    console.error('Error in PDF generation process:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error during PDF generation' }),
    };
  }
};
