import { Inject, Injectable, Logger } from '@nestjs/common';
import { MODULE_OPTIONS_TOKEN } from './cognito.module-definition';
import { CognitoModuleOptions } from './cognito.interfaces';
import {
  AdminDeleteUserCommand,
  AdminUserGlobalSignOutCommand,
  AdminUpdateUserAttributesCommand,
  CognitoIdentityProviderClient,
} from '@aws-sdk/client-cognito-identity-provider';

@Injectable()
export class CognitoService {
  private readonly logger = new Logger(CognitoService.name);
  private readonly cognitoProvider: CognitoIdentityProviderClient;

  constructor(
    @Inject(MODULE_OPTIONS_TOKEN) private options: CognitoModuleOptions,
  ) {
    this.cognitoProvider = new CognitoIdentityProviderClient({
      credentials: {
        accessKeyId: this.options.accessKeyId,
        secretAccessKey: this.options.secretAccessKey,
      },
      region: options.region,
    });
  }

  async updateUser(cognitoId: string, phoneNumber: string): Promise<unknown> {
    const command = new AdminUpdateUserAttributesCommand({
      UserPoolId: this.options.defaultUserPoolId,
      Username: cognitoId,
      UserAttributes: [
        {
          Name: 'phone_number',
          Value: phoneNumber,
        },
      ],
    });

    return await this.cognitoProvider.send(command);
  }

  async deleteUser(cognitoId: string): Promise<unknown> {
    const deleteUserCommand = new AdminDeleteUserCommand({
      UserPoolId: this.options.defaultUserPoolId,
      Username: cognitoId,
    });

    return this.cognitoProvider.send(deleteUserCommand);
  }

  async globalSignOut(cognitoId: string): Promise<unknown> {
    const revokeTokenCommand = new AdminUserGlobalSignOutCommand({
      UserPoolId: this.options.defaultUserPoolId,
      Username: cognitoId,
    });

    const data = await this.cognitoProvider.send(revokeTokenCommand);
    return data;
  }
}
