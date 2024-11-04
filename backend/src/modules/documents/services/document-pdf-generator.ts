import { Injectable } from '@nestjs/common';
import { resolve } from 'path';
import * as fs from 'fs';
import Handlebars from 'handlebars';
import { DocumentContractRepositoryService } from '../repositories/document-contract.repository';
import { format } from 'date-fns';
import {
  InvokeCommand,
  InvokeCommandInput,
  InvokeCommandOutput,
  LambdaClient,
} from '@aws-sdk/client-lambda';

const lambdaClient = new LambdaClient({ region: process.env.AWS_REGION });

async function invokeFunction(
  name: string,
  payload: {
    htmlPayload: string;
    documentContractId: string;
    organizationId: string;
    existingFilePath: string;
  },
): Promise<{ message: string; url: string }> {
  try {
    const input: InvokeCommandInput = {
      FunctionName: name,
      InvocationType: 'RequestResponse',
      Payload: Buffer.from(JSON.stringify(payload), 'utf8'),
    };

    const command = new InvokeCommand(input);

    const res: InvokeCommandOutput = await lambdaClient.send(command);

    const result = JSON.parse(Buffer.from(res.Payload).toString());

    if (result?.statusCode !== 200 || !result?.body) {
      throw new Error(result.body);
    }

    try {
      return JSON.parse(result?.body);
    } catch (e) {
      console.log('error parsing result', e);
      throw new Error(
        `[PDF Invoker Function]Error parsing result, ${JSON.stringify(e)}`,
      );
    }
  } catch (e) {
    console.log('error triggering function', e as Error);
    throw e;
  }
}

export type ContractPDFVariables = {
  documentContractNumber: string;
  documentContractDate: string;
  documentContractStartDate: string;
  documentContractEndDate: string;
  documentContractTerms: string;

  organizationName: string;
  organizationAddress: string;
  organizationCUI: string;
  organizationRepresentativeName: string;
  organizationRepresentativeRole: string;
  organizationLegalRepresentativeSignatureBase64?: string;

  volunteerName: string;
  volunteerAddress: string;
  volunteerCNP: string;
  volunteerIdentitySeries: string;
  volunteerIdentityNumber: string;
  volunteerIdentityIssuer: string;
  volunteerIdentityIssuedAt: string;
  volunteerSignatureBase64?: string;

  volunteerLegalGuardianName?: string;
  volunteerLegalGuardianAddress?: string;
  volunteerLegalGuardianEmail?: string;
  volunteerLegalGuardianPhone?: string;
  volunteerLegalGuardianCNP?: string;
  volunteerLegalGuardianIdentitySeries?: string;
  volunteerLegalGuardianIdentityNumber?: string;
  volunteerLegalGuardianSignatureBase64?: string;
};
@Injectable()
export class DocumentPDFGenerator {
  constructor(
    private readonly documentContractRepository: DocumentContractRepositoryService,
  ) {
    // // TODO: This should be handled using a HandlebarsAdapter, similar to MailerModule to register partials/helpers/etc
    // const templateDir = resolve(
    //   __dirname,
    //   '..',
    //   'templates/partials',
    //   'header.hbs',
    // );
    // const file = fs.readFileSync(templateDir, 'utf-8');
    // const template = Handlebars.compile(file);
    // Handlebars.registerPartial('header', template);
  }

  public async generateContractPDF(documentContractId: string): Promise<void> {
    const documentContract =
      await this.documentContractRepository.findOneForPDFGeneration(
        documentContractId,
      );

    const contractPDFVariables: ContractPDFVariables = {
      documentContractNumber: documentContract.documentNumber,
      documentContractDate: format(documentContract.documentDate, 'dd-MM-yyyy'),
      documentContractStartDate: format(
        documentContract.documentStartDate,
        'dd-MM-yyyy',
      ),
      documentContractEndDate: format(
        documentContract.documentEndDate,
        'dd-MM-yyyy',
      ),
      documentContractTerms: documentContract.documentTemplate.documentTerms,

      organizationName: documentContract.organization.name,
      organizationAddress: documentContract.organization.address,
      organizationCUI: documentContract.organization.cui,
      organizationRepresentativeName:
        documentContract.organization.legalReprezentativeFullName,
      organizationRepresentativeRole:
        documentContract.organization.legalReprezentativeRole,
      organizationLegalRepresentativeSignatureBase64:
        documentContract.ngoLegalRepresentativeSignature?.signature,

      volunteerName: documentContract.volunteerData.name,
      volunteerAddress: documentContract.volunteerData.address,
      volunteerCNP: documentContract.volunteerData.cnp,
      volunteerIdentitySeries:
        documentContract.volunteerData.identityDocumentSeries,
      volunteerIdentityNumber:
        documentContract.volunteerData.identityDocumentNumber,
      volunteerIdentityIssuer:
        documentContract.volunteerData.identityDocumentIssuedBy,
      volunteerIdentityIssuedAt: format(
        documentContract.volunteerData.identityDocumentIssueDate,
        'dd-MM-yyyy',
      ),
      volunteerSignatureBase64: documentContract.volunteerSignature?.signature,

      volunteerLegalGuardianName:
        documentContract.volunteerData.legalGuardian?.name,
      volunteerLegalGuardianAddress:
        documentContract.volunteerData.legalGuardian?.address,
      volunteerLegalGuardianEmail:
        documentContract.volunteerData.legalGuardian?.email,
      volunteerLegalGuardianPhone:
        documentContract.volunteerData.legalGuardian?.phone,
      volunteerLegalGuardianCNP:
        documentContract.volunteerData.legalGuardian?.cnp,
      volunteerLegalGuardianIdentitySeries:
        documentContract.volunteerData.legalGuardian?.identityDocumentSeries,
      volunteerLegalGuardianIdentityNumber:
        documentContract.volunteerData.legalGuardian?.identityDocumentNumber,
      volunteerLegalGuardianSignatureBase64:
        documentContract.legalGuardianSignature?.signature,
    };

    const templateDir = resolve(__dirname, '..', 'templates', 'contract.hbs');
    const file = fs.readFileSync(templateDir, 'utf-8');
    const template = Handlebars.compile(file);
    const fileHTML = template({
      ...contractPDFVariables,
    });

    // HTMLtoPDF(fileHTML);

    const result = await invokeFunction(process.env.PDF_GENERATOR_LAMBDA_NAME, {
      htmlPayload: fileHTML,
      documentContractId,
      organizationId: documentContract.organizationId,
      existingFilePath: documentContract.filePath,
    });

    await this.documentContractRepository.update(documentContractId, {
      filePath: result.url,
    });
  }
}
