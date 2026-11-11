import { ContractEntity } from '../entities/contract.entity';
import { DocumentType } from '../enums/document-type.enum';
import { ContractTransformer } from './contract.model';

describe('ContractTransformer fileName', () => {
  it.each([
    [DocumentType.CONTRACT, 'Contract'],
    [DocumentType.CERTIFICATE, 'Adeverinta'],
  ])('sanitizes the number for %s without changing it', (type, prefix) => {
    const entity = new ContractEntity();
    entity.contractNumber = '12/2026';
    entity.path = 'contracts/signed.pdf';
    entity.type = type;

    const model = ContractTransformer.fromEntity(entity);

    expect(model.fileName).toBe(`${prefix}_12-2026.pdf`);
    expect(model.contractNumber).toBe('12/2026');
    expect(entity.contractNumber).toBe('12/2026');
  });

  it('preserves the ID fallback and file extension', () => {
    const entity = new ContractEntity();
    entity.id = '12345678-abcd';
    entity.path = 'contracts/unsigned.docx';

    expect(ContractTransformer.fromEntity(entity).fileName).toBe(
      'Contract_12345678.docx',
    );
  });
});
