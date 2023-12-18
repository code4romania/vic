import { Module } from '@nestjs/common';
import { ConfigurableModuleClass } from './cognito.module-definition';
import { CognitoService } from './cognito.service';

@Module({
  providers: [CognitoService],
  exports: [CognitoService],
})
export class CognitoModule extends ConfigurableModuleClass {}
