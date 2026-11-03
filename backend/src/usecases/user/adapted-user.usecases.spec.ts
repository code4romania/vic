import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { S3Service } from 'src/infrastructure/providers/s3/module/s3.service';
import { AuthRealm } from 'src/modules/auth/enums/auth.enums';
import { AuthIdentityFacade } from 'src/modules/auth/services/auth-identity.facade';
import { NotificationsSettingsFacade } from 'src/modules/notifications/notifications-settings.facade';
import { OrganizationFacadeService } from 'src/modules/organization/services/organization.facade';
import { UserFacadeService } from 'src/modules/user/services/user-facade.service';
import { CreateRegularUsereUseCaseService } from './create-regular-user.usecase';
import { DeleteAccountRegularUserUsecase } from './delete-account.usecase';
import { GetOneRegularUserProfileUseCase } from './get-regule-user-profile.usecase';
import { UpdateRegularUserUsecase } from './update-regular-user.usecase';
import { UpdateUserPersonalDataUsecase } from './update-user-personal-data.usecase';

const exceptions = new ExceptionsService();

describe('user use cases adapted to own auth', () => {
  let users: Record<string, jest.Mock>;
  let identities: {
    findIdentity: jest.Mock;
    updateIdentity: jest.Mock;
    deleteByUserId: jest.Mock;
  };

  beforeEach(() => {
    users = {
      findRegularUser: jest.fn(),
      createRegularUser: jest.fn().mockResolvedValue({ id: 'new-user' }),
      softDeleteAndAnonimizeRegularUser: jest.fn().mockResolvedValue({}),
    };
    identities = {
      findIdentity: jest.fn(),
      updateIdentity: jest.fn(),
      deleteByUserId: jest.fn(),
    };
  });

  describe('CreateRegularUsereUseCaseService', () => {
    let profile: { execute: jest.Mock };
    let useCase: CreateRegularUsereUseCaseService;
    const newUser = {
      firstName: 'Elena',
      lastName: 'V',
      phone: '+40720000001',
    } as never;

    beforeEach(() => {
      profile = { execute: jest.fn().mockResolvedValue({ id: 'new-user' }) };
      useCase = new CreateRegularUsereUseCaseService(
        users as unknown as UserFacadeService,
        exceptions,
        {
          create: jest.fn().mockResolvedValue({ id: 'settings' }),
        } as unknown as NotificationsSettingsFacade,
        profile as unknown as GetOneRegularUserProfileUseCase,
        identities as unknown as AuthIdentityFacade,
      );
    });

    it('refuses a login that already has a profile, before touching the user table', async () => {
      identities.findIdentity.mockResolvedValue({
        id: 'identity',
        realm: AuthRealm.MOBILE,
        email: 'elena@example.ro',
        userId: 'existing-user',
      });

      await expect(useCase.execute(newUser, 'identity')).rejects.toMatchObject({
        response: { code_error: 'USER_003' },
      });
      expect(users.findRegularUser).not.toHaveBeenCalled();
      expect(users.createRegularUser).not.toHaveBeenCalled();
    });

    it("creates the user with the login's email and links it to the login", async () => {
      identities.findIdentity.mockResolvedValue({
        id: 'identity',
        realm: AuthRealm.MOBILE,
        email: 'elena@example.ro',
        userId: null,
      });
      users.findRegularUser.mockResolvedValue(null);

      await useCase.execute(newUser, 'identity');

      expect(users.createRegularUser).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'elena@example.ro',
          phone: '+40720000001',
        }),
      );
      expect(identities.updateIdentity).toHaveBeenCalledWith('identity', {
        userId: 'new-user',
      });
    });

    it('refuses a web login', async () => {
      identities.findIdentity.mockResolvedValue({
        id: 'identity',
        realm: AuthRealm.WEB,
      });

      await expect(useCase.execute(newUser, 'identity')).rejects.toMatchObject({
        response: { code_error: 'USER_005' },
      });
    });
  });

  describe('a user with no id is USER_001 before any lookup', () => {
    const notFound = { response: { code_error: 'USER_001' }, status: 404 };

    it('get profile', async () => {
      const useCase = new GetOneRegularUserProfileUseCase(
        users as unknown as UserFacadeService,
        exceptions,
        {} as OrganizationFacadeService,
        {} as S3Service,
      );

      await expect(useCase.execute({ id: undefined })).rejects.toMatchObject(
        notFound,
      );
      expect(users.findRegularUser).not.toHaveBeenCalled();
    });

    it('update profile', async () => {
      const useCase = new UpdateRegularUserUsecase(
        users as unknown as UserFacadeService,
        {} as GetOneRegularUserProfileUseCase,
        exceptions,
        {} as S3Service,
      );

      await expect(
        useCase.execute(undefined, {} as never),
      ).rejects.toMatchObject(notFound);
      expect(users.findRegularUser).not.toHaveBeenCalled();
    });

    it('update personal data', async () => {
      const useCase = new UpdateUserPersonalDataUsecase(
        users as unknown as UserFacadeService,
        exceptions,
      );

      await expect(
        useCase.execute(undefined, {} as never),
      ).rejects.toMatchObject(notFound);
      expect(users.findRegularUser).not.toHaveBeenCalled();
    });

    it('delete account, which then deletes the login through the facade', async () => {
      const useCase = new DeleteAccountRegularUserUsecase(
        users as unknown as UserFacadeService,
        {} as GetOneRegularUserProfileUseCase,
        exceptions,
        { deleteFile: jest.fn() } as unknown as S3Service,
        identities as unknown as AuthIdentityFacade,
        { deleteMany: jest.fn() } as never,
        {
          softDeleteManyAndProfiles: jest
            .fn()
            .mockResolvedValue({ deletedVolunteers: [] }),
        } as never,
        { deleteManyByVolunteerId: jest.fn() } as never,
        { deleteAllForUser: jest.fn() } as never,
        { deleteAllRSVPsForUser: jest.fn() } as never,
      );

      await expect(useCase.execute(undefined)).rejects.toMatchObject(notFound);
      expect(users.findRegularUser).not.toHaveBeenCalled();
      expect(identities.deleteByUserId).not.toHaveBeenCalled();

      users.findRegularUser.mockResolvedValue({ id: 'user-id' });
      await useCase.execute('user-id');
      expect(identities.deleteByUserId).toHaveBeenCalledWith('user-id');
    });
  });
});
