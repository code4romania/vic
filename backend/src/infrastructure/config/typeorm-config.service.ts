import { Injectable } from '@nestjs/common';
import { TypeOrmOptionsFactory, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { VolunteerHistorySubscriber } from 'src/modules/volunteer/entities/history/volunteer-history.subscriber';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: this.configService.get('DATABASE_HOST'),
      port: +this.configService.get('DATABASE_PORT'),
      username: this.configService.get('DATABASE_USER'),
      password: this.configService.get('DATABASE_PASSWORD'),
      database: this.configService.get('DATABASE_NAME'),
      migrations: ['dist/migrations/*.js'],
      autoLoadEntities: true,
      migrationsRun: true,
      synchronize: false, // never set it to TRUE in production
      subscribers: [VolunteerHistorySubscriber],
      logging: parseInt(this.configService.get('TYPEORM_DEBUG')) ? true : false,
      ssl:
        this.configService.get('NODE_ENV') === 'local'
          ? false
          : {
              rejectUnauthorized: false,
            },
    };
  }
}
