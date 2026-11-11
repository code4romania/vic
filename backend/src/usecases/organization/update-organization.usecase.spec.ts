import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UpdateOrganizationDto } from 'src/api/organization/dto/update-organization.dto';
import { RegisterOrganizationDto } from 'src/api/organization/dto/register-organization.dto';
import { ActionsArchiveFacade } from 'src/modules/actions-archive/actions-archive.facade';
import { S3Service } from 'src/infrastructure/providers/s3/module/s3.service';
import { OrganizationFacadeService } from 'src/modules/organization/services/organization.facade';
import { IAdminUserModel } from 'src/modules/user/models/admin-user.model';
import { GetOrganizationUseCaseService } from './get-organization.usecase';
import { UpdateOrganizationUseCase } from './update-organization.usecase';

describe('UpdateOrganizationUseCase CUI validation', () => {
  const admin = { organizationId: 'org-1' } as IAdminUserModel;
  const current = { id: 'org-1', name: 'Test NGO', taxId: '12345678' };
  const organizations = {
    findConflicts: jest.fn().mockResolvedValue([]),
    updateOrganization: jest.fn().mockResolvedValue(current),
  };
  const getOrganization = { execute: jest.fn() };
  const archive = { trackEvent: jest.fn() };
  const useCase = new UpdateOrganizationUseCase(
    organizations as unknown as OrganizationFacadeService,
    getOrganization as unknown as GetOrganizationUseCaseService,
    archive as unknown as ActionsArchiveFacade,
    {} as S3Service,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it.each([null, new Date('2026-11-01')])(
    'saves other fields with an unchanged invalid CUI (validatedAt: %s)',
    async (validatedAt) => {
      getOrganization.execute.mockResolvedValue({ ...current, validatedAt });
      const dto = plainToInstance(UpdateOrganizationDto, {
        taxId: 'RO 12345678',
        name: 'Updated NGO',
      });
      expect(await validate(dto)).toEqual([]);

      await useCase.execute(dto, admin);

      expect(organizations.updateOrganization).toHaveBeenCalledWith('org-1', {
        name: 'Updated NGO',
      });
    },
  );

  it('rejects a changed invalid CUI for an unvalidated organization', async () => {
    getOrganization.execute.mockResolvedValue({
      ...current,
      validatedAt: null,
    });

    await expect(
      useCase.execute({ taxId: '18547291' }, admin),
    ).rejects.toMatchObject({
      status: 400,
      response: { message: ['taxId must be a valid CUI'] },
    });
    expect(organizations.updateOrganization).not.toHaveBeenCalled();
  });

  it('allows changing to a valid CUI before validation', async () => {
    getOrganization.execute.mockResolvedValue({
      ...current,
      validatedAt: null,
    });

    await useCase.execute({ taxId: '18547290' }, admin);

    expect(organizations.updateOrganization).toHaveBeenCalledWith('org-1', {
      taxId: '18547290',
    });
  });

  it('keeps the CUI locked after validation', async () => {
    getOrganization.execute.mockResolvedValue({
      ...current,
      validatedAt: new Date(),
    });

    await expect(
      useCase.execute({ taxId: '18547290' }, admin),
    ).rejects.toMatchObject({
      status: 400,
      response: { code_error: 'ORG_012' },
    });
    expect(organizations.updateOrganization).not.toHaveBeenCalled();
  });

  it('still rejects an invalid CUI at registration', async () => {
    const dto = plainToInstance(RegisterOrganizationDto, { taxId: '12345678' });
    const errors = await validate(dto);

    expect(
      errors.find((error) => error.property === 'taxId')?.constraints,
    ).toEqual({
      isCui: 'taxId must be a valid CUI',
    });
  });
});
