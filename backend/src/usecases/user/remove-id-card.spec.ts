import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { AccessRequestFacade } from 'src/modules/access-request/services/access-request.facade';
import { AccessCodeFacade } from 'src/modules/organization/services/access-code.facade';
import { OrganizationFacadeService } from 'src/modules/organization/services/organization.facade';
import { UserFacadeService } from 'src/modules/user/services/user-facade.service';
import { VolunteerFacade } from 'src/modules/volunteer/services/volunteer.facade';
import { CreateAccessRequestUseCase } from '../access-request/create-access-request.usecase';
import { OrganizationGateService } from '../organization/organization-gate.service';
import { CreateVolunteerUseCase } from '../volunteer/create-volunteer.usecase';
import { JoinOrganizationByAccessCodeUsecase } from '../volunteer/join-organization-by-access-code.usecase';

// VIC 2.0, issue #478: joining an organization needs a date of birth, not ID card data.
describe('joining an organization without ID card data (#478)', () => {
  const gate = {
    assertValidated: jest.fn(),
  } as unknown as OrganizationGateService;
  const userWithout = {
    findRegularUser: jest.fn().mockResolvedValue({ id: 'u', birthday: null }),
  } as unknown as UserFacadeService;
  const missingBirthday = { response: { code_error: 'USER_005' } };

  it('access request is refused without a date of birth', async () => {
    const organizations = { findOrganization: jest.fn() };
    const useCase = new CreateAccessRequestUseCase(
      gate,
      {} as AccessRequestFacade,
      organizations as unknown as OrganizationFacadeService,
      {} as VolunteerFacade,
      userWithout,
      new ExceptionsService(),
    );

    await expect(
      useCase.execute({ requestedById: 'u', organizationId: 'o' } as never),
    ).rejects.toMatchObject(missingBirthday);
    expect(organizations.findOrganization).not.toHaveBeenCalled();
  });

  it('access code join is refused without a date of birth', async () => {
    const codes = { find: jest.fn() };
    const useCase = new JoinOrganizationByAccessCodeUsecase(
      gate,
      userWithout,
      new ExceptionsService(),
      codes as unknown as AccessCodeFacade,
      {} as CreateVolunteerUseCase,
    );

    await expect(
      useCase.execute({
        requestedById: 'u',
        organizationId: 'o',
        code: 'c',
      }),
    ).rejects.toMatchObject(missingBirthday);
    expect(codes.find).not.toHaveBeenCalled();
  });

  it('a user with a date of birth passes the check', async () => {
    const codes = { find: jest.fn().mockResolvedValue(null) };
    const useCase = new JoinOrganizationByAccessCodeUsecase(
      gate,
      {
        findRegularUser: jest
          .fn()
          .mockResolvedValue({ id: 'u', birthday: new Date('2000-01-01') }),
      } as unknown as UserFacadeService,
      new ExceptionsService(),
      codes as unknown as AccessCodeFacade,
      {} as CreateVolunteerUseCase,
    );

    // fails later, on the (missing) access code: the birthday check passed
    await expect(
      useCase.execute({ requestedById: 'u', organizationId: 'o', code: 'c' }),
    ).rejects.not.toMatchObject(missingBirthday);
    expect(codes.find).toHaveBeenCalled();
  });
});
