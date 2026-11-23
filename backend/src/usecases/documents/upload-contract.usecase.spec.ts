import { EventEmitter2 } from '@nestjs/event-emitter';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { S3Service } from 'src/infrastructure/providers/s3/module/s3.service';
import { ActionsArchiveFacade } from 'src/modules/actions-archive/actions-archive.facade';
import { DocumentType } from 'src/modules/documents/enums/document-type.enum';
import { ContractFacade } from 'src/modules/documents/services/contract.facade';
import { EVENTS } from 'src/modules/notifications/constants/events.constants';
import GenerateContractEvent from 'src/modules/notifications/events/documents/generate-contract.event';
import { IAdminUserModel } from 'src/modules/user/models/admin-user.model';
import { VolunteerFacade } from 'src/modules/volunteer/services/volunteer.facade';
import { VolunteerStatus } from 'src/modules/volunteer/enums/volunteer-status.enum';
import { GetOrganizationUseCaseService } from '../organization/get-organization.usecase';
import { UploadContractUsecase } from './upload-contract.usecase';

// The volunteer is told when the NGO uploads a contract or a certificate for them.
describe('UploadContractUsecase notification', () => {
  const admin = { id: 'admin-1', organizationId: 'org-1' } as IAdminUserModel;
  const volunteer = {
    id: 'vol-1',
    status: VolunteerStatus.ACTIVE,
    user: {
      id: 'user-1',
      name: 'Lari Test',
      email: 'lari@example.test',
      notificationsSettings: {
        notificationsViaPush: true,
        notificationsViaEmail: false,
      },
    },
  };
  const pdf = {
    mimetype: 'application/pdf',
    buffer: Buffer.from('%PDF-1.4 test'),
  } as Express.Multer.File;

  const contracts = {
    findOne: jest.fn().mockResolvedValue(null),
    create: jest
      .fn()
      .mockResolvedValue({ id: 'contract-1', contractNumber: 'QA-1' }),
  };
  const volunteers = { find: jest.fn().mockResolvedValue(volunteer) };
  const getOrganization = {
    execute: jest.fn().mockResolvedValue({ id: 'org-1', name: 'QA ONG' }),
  };
  const s3 = {
    uploadFile: jest.fn().mockResolvedValue('contracts/org-1/x.pdf'),
  };
  const archive = { trackEvent: jest.fn() };
  const emitter = { emit: jest.fn() };

  const useCase = new UploadContractUsecase(
    contracts as unknown as ContractFacade,
    volunteers as unknown as VolunteerFacade,
    getOrganization as unknown as GetOrganizationUseCaseService,
    s3 as unknown as S3Service,
    new ExceptionsService(),
    archive as unknown as ActionsArchiveFacade,
    emitter as unknown as EventEmitter2,
  );

  beforeEach(() => jest.clearAllMocks());

  it('emits the new-document event for an uploaded contract', async () => {
    await useCase.execute(
      { volunteerId: 'vol-1', startDate: new Date('2026-11-23') },
      pdf,
      admin,
    );

    expect(emitter.emit).toHaveBeenCalledTimes(1);
    const [key, event] = emitter.emit.mock.calls[0];
    expect(key).toBe(EVENTS.DOCUMENTS.GENERATE_CONTRACT);
    expect(event).toBeInstanceOf(GenerateContractEvent);
    expect(event).toMatchObject({
      userId: 'user-1',
      organizationId: 'org-1',
      organizationName: 'QA ONG',
      notificationsViaPush: true,
      notificationsViaEmail: false,
      userEmail: 'lari@example.test',
      contractId: 'contract-1',
      isCertificate: false,
    });
  });

  it('marks a certificate as such', async () => {
    await useCase.execute(
      {
        volunteerId: 'vol-1',
        startDate: new Date('2026-11-23'),
        type: DocumentType.CERTIFICATE,
      },
      pdf,
      admin,
    );

    expect(emitter.emit.mock.calls[0][1].isCertificate).toBe(true);
  });

  it('does not notify when the upload is refused', async () => {
    await expect(
      useCase.execute(
        { volunteerId: 'vol-1', startDate: new Date('2026-11-23') },
        { ...pdf, buffer: Buffer.from('not a pdf') } as Express.Multer.File,
        admin,
      ),
    ).rejects.toMatchObject({ status: 400 });

    expect(emitter.emit).not.toHaveBeenCalled();
  });
});
