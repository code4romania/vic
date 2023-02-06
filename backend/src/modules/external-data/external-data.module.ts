import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { OngHubService } from './services/ong-hub.service';

@Module({
  imports: [HttpModule],
  providers: [OngHubService],
  exports: [OngHubService],
})
export class ExternalDataModule {}
