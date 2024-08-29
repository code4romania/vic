import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { PDFGenerator } from 'src/modules/documents/services/pdf-generator';

@Injectable()
export class GeneratePDFsUseCase implements IUseCaseService<unknown> {
  constructor(private readonly pDFGenerator: PDFGenerator) {}

  public async execute(): Promise<Uint8Array> {
    return this.pDFGenerator.generatePDF();
  }
}
