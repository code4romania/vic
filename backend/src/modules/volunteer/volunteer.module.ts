import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VolunteerEntity } from './entities/volunteer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([VolunteerEntity])],
  providers: [],
  exports: [],
})
export class VolunteerModule {}
