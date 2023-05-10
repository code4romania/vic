import { ConfigurableModuleBuilder } from '@nestjs/common';
import { S3ModuleOptions } from './s3.interfaces';

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
  new ConfigurableModuleBuilder<S3ModuleOptions>()
    .setFactoryMethodName('createS3ConfigOptions')
    .build();
