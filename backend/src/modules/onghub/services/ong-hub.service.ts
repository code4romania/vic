import { HttpService } from '@nestjs/axios';
import { HttpException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';
import { OngHubExceptionMessages } from '../exceptions/exceptions';
import { IUserWithOrganizationModel } from '../models/user-with-organization.model';

@Injectable()
export class OngHubService {
  private readonly logger = new Logger(OngHubService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  //  Get user and organization data from OngHub
  //  Because both Vic and OngHub refers to the same user pool the same token used in one can authorize a request in the other

  // cognito_user_id - user id of an admin user in VIC and a Admin/Employee user in OngHub
  // access_token - token sent by the Vic Web Client for requesting the user profile

  // This should be called on first user login where there is no data related to the user an it's organization in the VIC DB.
  public async getUserAndOrganizationDataFromOngHub(
    access_token: string,
  ): Promise<IUserWithOrganizationModel> {
    const request$ = this.httpService.get(
      `${this.configService.get('ONG_HUB_API')}api/ong-user`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
          'Content-Type': 'application/json;charset=utf-8',
          'Access-Control-Allow-Origin': '*',
        },
      },
    );

    // transform observable to promise
    return firstValueFrom(request$)
      .then((response) => response.data as IUserWithOrganizationModel)
      .catch((error: AxiosError) => {
        if (error.code === 'ECONNREFUSED') {
          // there is no connection with onghub server
          this.logger.error({
            ...error,
            ...OngHubExceptionMessages.ONG_001,
          });
        } else if (error.code === 'ERR_BAD_REQUEST') {
          // this is an onghub handled error
          this.logger.error({
            ...(error.response.data as HttpException),
            ...OngHubExceptionMessages.ONG_002,
          });
        } else {
          // any other error
          this.logger.error({
            error,
            ...OngHubExceptionMessages.ONG_003,
          });
        }

        // while the request fails we return nothing
        return null;
      });
  }
}
