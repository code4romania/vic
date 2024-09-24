const puppeteer = require("puppeteer-core");
const chromium = require("@sparticuz/chromium");
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");

const s3 = new S3Client({ region: 'us-east-1' });

chromium.setHeadlessMode = true;

exports.hello = async (event) => {

  console.log(event.headers);

  const documentContractId = event.headers['x-document-contract-id'];
  const organizationId = event.headers['x-organization-id'];
  const existingContractFilePath = event.headers['x-existing-file-path'];

  const browser = await puppeteer.launch({
    executablePath: await chromium.executablePath(),
    headless: chromium.headless,
    ignoreHTTPSErrors: true,
    // defaultViewport: chromium.defaultViewport,
    args: [...chromium.args, "--hide-scrollbars", "--disable-web-security", '--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();


  // TODO: send headers with desired name of the file documents/contracts/org-id/contract-(new Date().getTime()).pdf
  // TODO: also include in headers the name of the current contract, to be deleted and replaced with the new one

  await page.setContent(event.body);
  const buffer = await page.pdf({ format: 'A4' });
  await browser.close();

  const s3Params = {
    Bucket: 'test-pdfs-vic', // replace with your bucket name
    Key: `documents/contracts/${organizationId}/${documentContractId}-${+new Date().getTime()}.pdf`, // replace with your desired file name
    Body: buffer,
    ContentType: 'application/pdf',
  };


  try {
    const command = new PutObjectCommand(s3Params);
    const fileInS3 = await s3.send(command);
  } catch (error) {
    console.error('Error uploading PDF to S3:', error);
    throw new Error('Failed to upload PDF to S3');
  }

  try {
    const deleteCommand = new DeleteObjectCommand({
      Bucket: 'test-pdfs-vic',
      Key: existingContractFilePath,
    });
    await s3.send(deleteCommand);
  } catch (error) {
    console.error('Error deleting existing PDF from S3:', error);
    //TODO: catch in Sentry
  }

  console.log({ url: `https://${s3Params.Bucket}.s3.amazonaws.com/${s3Params.Key}` });

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'PDF successfully uploaded to S3',
      url: s3Params.Key,
    }),
  };
};


