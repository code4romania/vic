import { ConfigurableModuleBuilder } from '@nestjs/common';
import { CognitoModuleOptions } from './cognito.interfaces';

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
  new ConfigurableModuleBuilder<CognitoModuleOptions>()
    .setExtras(
      {
        isGlobal: true,
      },
      (definition, extras) => ({
        ...definition,
        global: extras.isGlobal,
      }),
    )
    .setFactoryMethodName('createCognitoConfigOptions')
    .build();
