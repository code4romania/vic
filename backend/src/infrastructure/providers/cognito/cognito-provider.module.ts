import { Global, Module } from '@nestjs/common';
import { CognitoModule } from './module/cognito.module';
import { CognitoConfigService } from 'src/infrastructure/config/cognito.config';

@Global()
@Module({
  imports: [
    CognitoModule.registerAsync({
      useClass: CognitoConfigService,
    }),
  ],
  exports: [CognitoModule],
})
export class CognitoProviderModule {}
