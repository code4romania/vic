import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { IUserWithOrganizationModel } from '../models/user-with-organization.model';

@Injectable()
export class OngHubService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  //  Get user and organization data from OngHub
  //  Because both Teo and OngHub refers to the same user pool the same token used in one can authorize a request in the other

  // cognito_user_id - user id of an admin user in TEO and a Admin/Employee user in OngHub
  // access_token - token sent by the Teo Web Client for requesting the user profile

  // This should be called on first user login where there is no data related to the user an it's organization in the TEO DB.
  public async getUserAndOrganizationDataFromOngHub(
    cognito_user_id: string,
    access_token: string,
  ): Promise<IUserWithOrganizationModel> {
    const request$ = this.httpService.get(
      `${this.configService.get('ONG_HUB_API')}api/ong-user/${cognito_user_id}`,
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
      .catch((error) => {
        // handle error of failing request here
        console.log(error);
        return null;
      });
  }
}
