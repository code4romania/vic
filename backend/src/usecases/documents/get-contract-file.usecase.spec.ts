import { Readable } from 'stream';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { S3Service } from 'src/infrastructure/providers/s3/module/s3.service';
import { ContractFacade } from 'src/modules/documents/services/contract.facade';
import { GetContractFileUsecase } from './get-contract-file.usecase';

// #724: the file behind the in-app viewer and the Download button
describe('GetContractFileUsecase', () => {
  const body = Readable.from(['%PDF-1.4']);
  const contracts = { findOne: jest.fn() };
  const s3 = { getFile: jest.fn() };
  const useCase = new GetContractFileUsecase(
    contracts as unknown as ContractFacade,
    new ExceptionsService(),
    s3 as unknown as S3Service,
  );

  beforeEach(() => {
    jest.resetAllMocks();
    contracts.findOne.mockResolvedValue({
      id: 'c1',
      path: 'contracts/org-1/uuid-semnat.pdf',
      fileName: 'Contract_12-2026.pdf',
    });
    s3.getFile.mockResolvedValue({ body, contentLength: 8 });
  });

  it('returns the stored file with the contract file name and type', async () => {
    await expect(
      useCase.execute(
        { id: 'c1', organizationId: 'org-1' },
        { requireOrganization: true },
      ),
    ).resolves.toEqual({
      body,
      contentLength: 8,
      fileName: 'Contract_12-2026.pdf',
      contentType: 'application/pdf',
    });
    expect(contracts.findOne).toHaveBeenCalledWith({
      id: 'c1',
      organizationId: 'org-1',
    });
    expect(s3.getFile).toHaveBeenCalledWith('contracts/org-1/uuid-semnat.pdf');
  });

  it('is not found for an admin without an organization, before any lookup', async () => {
    await expect(
      useCase.execute({ id: 'c1' }, { requireOrganization: true }),
    ).rejects.toMatchObject({ response: { code_error: 'CONTRACT_002' } });
    expect(contracts.findOne).not.toHaveBeenCalled();
  });

  it('is not found when the contract or its stored file is missing', async () => {
    contracts.findOne.mockResolvedValueOnce(null);
    await expect(
      useCase.execute({ id: 'c1' }, { requireOrganization: false }),
    ).rejects.toMatchObject({ response: { code_error: 'CONTRACT_002' } });

    s3.getFile.mockResolvedValueOnce(null);
    await expect(
      useCase.execute({ id: 'c1' }, { requireOrganization: false }),
    ).rejects.toMatchObject({ response: { code_error: 'CONTRACT_010' } });
  });
});
