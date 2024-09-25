import { Injectable } from '@nestjs/common';
import { resolve } from 'path';
import * as fs from 'fs';
import Handlebars from 'handlebars';
import axios from 'axios';
import { DocumentContractRepositoryService } from '../repositories/document-contract.repository';
import { format } from 'date-fns';

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
    // this.generateContractPDF('7064e696-01ba-423e-a341-afd83d563481');
  }

  public async generateContractPDF(documentContractId: string): Promise<void> {
    const documentContract =
      await this.documentContractRepository.findOneForPDFGeneration(
        documentContractId,
      );

    console.log(documentContract);

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

    const result = await axios.post(
      'https://715w11fnq9.execute-api.eu-west-1.amazonaws.com/generate-pdf',
      fileHTML,
      {
        headers: {
          'Content-Type': 'text/html',
          'X-Document-Contract-Id': documentContractId,
          'X-Organization-Id': documentContract.organizationId,
          'X-Existing-File-Path': documentContract.filePath,
        },
      },
    );

    await this.documentContractRepository.update(documentContractId, {
      filePath: result.data.url,
    });

    return result.data.url;
  }
}
