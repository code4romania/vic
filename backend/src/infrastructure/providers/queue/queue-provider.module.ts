import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { BullConfigService } from 'src/infrastructure/config/bull-config.service';

@Module({
  imports: [
    BullModule.forRootAsync({
      useClass: BullConfigService,
    }),
  ],
})
export class QueueProviderModule {}
