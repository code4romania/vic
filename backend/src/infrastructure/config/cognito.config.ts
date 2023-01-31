import * as dotenv from 'dotenv';

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
