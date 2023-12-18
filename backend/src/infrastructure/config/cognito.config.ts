import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';
import { CognitoModuleOptions } from '../providers/cognito/module/cognito.interfaces';

dotenv.config();

export enum CognitoConfigType {
  WEB = 'web',
  MOBILE = 'mobile',
}

interface CognitoConfig {
  userPoolId: string;
  clientId: string;
  region: string;
  authority: string;
}

const ConfigEnvKeys: Record<CognitoConfigType, CognitoConfig> = {
  [CognitoConfigType.WEB]: {
    userPoolId: process.env.COGNITO_USER_POOL_ID_WEB,
    clientId: process.env.COGNITO_CLIENT_ID_WEB,
    region: process.env.COGNITO_REGION_WEB,
    authority: `https://cognito-idp.${process.env.COGNITO_REGION_WEB}.amazonaws.com/${process.env.COGNITO_USER_POOL_ID_WEB}`,
  },
  [CognitoConfigType.MOBILE]: {
    userPoolId: process.env.COGNITO_USER_POOL_ID_MOBILE,
    clientId: process.env.COGNITO_CLIENT_ID_MOBILE,
    region: process.env.COGNITO_REGION_MOBILE,
    authority: `https://cognito-idp.${process.env.COGNITO_REGION_MOBILE}.amazonaws.com/${process.env.COGNITO_USER_POOL_ID_MOBILE}`,
  },
};

export function getCognitoProperty<Property extends keyof CognitoConfig>(
  target: CognitoConfigType,
  property: Property,
): CognitoConfig[Property] {
  return ConfigEnvKeys[target][property];
}

// Service to configure the CognitoModule for Mobile
@Injectable()
export class CognitoConfigService {
  constructor(private configService: ConfigService) {}

  createCognitoConfigOptions(): CognitoModuleOptions {
    return {
      accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
      region: this.configService.get('AWS_REGION'),
      defaultUserPoolId: getCognitoProperty(
        CognitoConfigType.MOBILE,
        'userPoolId',
      ),
    };
  }
}
