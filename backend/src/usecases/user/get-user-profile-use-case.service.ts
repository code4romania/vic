import { Injectable } from '@nestjs/common';
import { OngHubService } from 'src/modules/external-data/services/ong-hub.service';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';

@Injectable()
export class GetUserProfileUseCaseService implements IUseCaseService<unknown> {
  constructor(private readonly ongHubService: OngHubService) {}

  async execute(cognito_user_id: string, token: string): Promise<void> {
    // check if user in the database

    // if user not found do this
    const { user, organization } =
      await this.ongHubService.getUserAndOrganizationDataFromOngHub(
        cognito_user_id,
        token,
      );

    console.log('user', user);
    console.log('organization', organization);

    // return user
  }
}
