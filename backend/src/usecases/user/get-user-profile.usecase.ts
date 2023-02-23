import { Injectable, Logger } from '@nestjs/common';
import { OngHubService } from 'src/modules/onghub/services/ong-hub.service';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { UserFacadeService } from 'src/modules/user/services/user-facade.service';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { OngHubExceptionMessages } from 'src/modules/onghub/exceptions/exceptions';
import { OrganizationFacadeService } from 'src/modules/organization/services/organization.facade';
import { OrganizationExceptionMessages } from 'src/modules/organization/exceptions/exceptions';
import { UserExceptionMessages } from 'src/modules/user/exceptions/exceptions';
import { IAdminUserModel } from 'src/modules/user/models/admin-user.model';
import { IError } from 'src/common/exceptions/exceptions.interface';
import { JSONStringifyError } from 'src/common/helpers/stringify-error';
import { IUserModel } from 'src/modules/user/models/base-user.model';

@Injectable()
export class GetUserProfileUseCaseService
  implements IUseCaseService<IAdminUserModel>
{
  private readonly logger = new Logger(GetUserProfileUseCaseService.name);

  constructor(
    private readonly ongHubService: OngHubService,
    private readonly userService: UserFacadeService,
    private readonly exceptionService: ExceptionsService,
    private readonly organizationService: OrganizationFacadeService,
  ) {}

  async execute(
    cognitoUserId: string,
    token: string,
  ): Promise<IAdminUserModel> {
    // check if user in the database
    const existingUser = await this.userService.findAdminUser({
      cognitoId: cognitoUserId,
    });

    // if user exists in the databse return the user
    if (existingUser) {
      this.logger.debug('Loading admin user profile from the database....');
      // if the user was found return the user
      return existingUser;
    }

    this.logger.debug(
      'Retrieving admin user profile and organization from ONG Hub....',
    );
    // scenario where the user doesn't exist and we need to retrieve it from the ONG Hub
    const userWithOrganization =
      await this.ongHubService.getUserAndOrganizationDataFromOngHub(token);

    // check if there was any error with the request
    if (!userWithOrganization) {
      // return internal server exception as we could not retrieve the data
      this.exceptionService.internalServerErrorException(
        OngHubExceptionMessages.ONG_002,
      );
    }

    const { user, organization } = userWithOrganization;

    // check if there is already an organization with the same data
    let dbOrganization = await this.organizationService.findOrganization([
      { name: organization.name },
      { phone: organization.phone },
      { email: organization.email },
    ]);

    try {
      // if there is no organization save it
      if (!dbOrganization) {
        // save organization to database
        dbOrganization = await this.organizationService.createOrganization(
          organization,
        );
      }
    } catch (error) {
      // log the error and the payload
      this.logger.error({
        error,
        ...OrganizationExceptionMessages.ORG_003,
        organization,
      });

      // throw bad server exception for failing to save the organization
      this.exceptionService.internalServerErrorException(
        OrganizationExceptionMessages.ORG_003,
      );
    }

    // check if there is already a user with the same data
    const dbUser = await this.userService.findAdminUser([
      {
        email: user.email,
      },
      { phone: user.phone },
    ]);

    // there is already an user with the same phone number and email
    if (dbUser) {
      this.exceptionService.badRequestException(UserExceptionMessages.USER_003);
    }

    try {
      // save user to database
      const adminUser = await this.userService.createAdmin({
        ...user,
        organizationId: dbOrganization.id,
      });

      // return newly created
      return adminUser;
    } catch (error) {
      // log the error and the payload
      this.logger.debug({
        error,
        ...UserExceptionMessages.USER_002,
        user: {
          ...user,
          organizationId: dbOrganization.id,
        },
      });

      // throw bad server exception for failing to save the organization
      this.exceptionService.internalServerErrorException(
        UserExceptionMessages.USER_002,
      );
    }
  }
}
