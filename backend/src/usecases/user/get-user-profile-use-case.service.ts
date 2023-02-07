import { Injectable, Logger } from '@nestjs/common';
import { OngHubService } from 'src/modules/onghub/services/ong-hub.service';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { UserFacadeService } from 'src/modules/user/services/user-facade.service';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { OngHubExceptionMessages } from 'src/modules/onghub/exceptions/exceptions';
import { OrganizationFacadeService } from 'src/modules/organization/services/organization-facade.service';
import { OrganizationExceptionMessages } from 'src/modules/organization/exceptions/exceptions';
import { UserExceptionMessages } from 'src/modules/user/exceptions/exceptions';
import { IAdminUserModel } from 'src/modules/user/models/admin-user.model';

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
    const existingUser = await this.userService.getAdminUserByCognitoId(
      cognitoUserId,
    );

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
      await this.ongHubService.getUserAndOrganizationDataFromOngHub(
        cognitoUserId,
        token,
      );

    // check if there was any error with the request
    if (!userWithOrganization) {
      // return internal server exception as we could not retrieve the data
      this.exceptionService.internalServerErrorException(
        OngHubExceptionMessages.ONG_002,
      );
    }

    const { user, organization } = userWithOrganization;

    // save organization to database
    const createdOrganization =
      await this.organizationService.createOrganization(organization);

    // if organization was not saved throw error
    if (!createdOrganization) {
      // throw bad server exception for failing to save the organization
      this.exceptionService.internalServerErrorException(
        OrganizationExceptionMessages.ORG_003,
      );

      // log the error and the payload
      this.logger.debug({
        ...OrganizationExceptionMessages.ORG_003,
        organization,
      });
    }

    // save user to database
    const adminUser = await this.userService.createAdmin({
      ...user,
      organizationId: createdOrganization.id,
    });

    // if user was not saved throw error
    if (!adminUser) {
      // throw bad server exception for failing to save the organization
      this.exceptionService.internalServerErrorException(
        UserExceptionMessages.USER_002,
      );

      // log the error and the payload
      this.logger.debug({
        ...UserExceptionMessages.USER_002,
        user: {
          ...user,
          organizationId: createdOrganization.id,
        },
      });
    }

    // return newly created
    return adminUser;
  }
}
