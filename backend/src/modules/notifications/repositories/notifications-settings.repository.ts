import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { INotificationsSettingsRepository } from '../interfaces/notifications-settings-respository.interface';
import { NotificationsSettingsEntity } from '../entities/notifications-settings.entity';
import {
  INotificationsSettingsModel,
  IUpdateNotificationsSettingsOptions,
  NotificationsSettingsTransformer,
} from '../models/notifications-settings.model';

@Injectable()
export class NotificationsSettingsRepository
  implements INotificationsSettingsRepository
{
  constructor(
    @InjectRepository(NotificationsSettingsEntity)
    private readonly notificationsSettingsRepository: Repository<NotificationsSettingsEntity>,
  ) {}

  public async create(): Promise<INotificationsSettingsModel> {
    const settings = await this.notificationsSettingsRepository.save(
      NotificationsSettingsTransformer.toEntity(),
    );

    return this.find(settings.id);
  }

  public async update(
    id: string,
    updates: IUpdateNotificationsSettingsOptions,
  ): Promise<INotificationsSettingsModel> {
    const toUpdate = await this.notificationsSettingsRepository.preload({
      id,
      ...updates,
    });

    if (!toUpdate) return null;

    await this.notificationsSettingsRepository.save(toUpdate);

    return this.find(id);
  }

  public async find(id: string): Promise<INotificationsSettingsModel> {
    const entity = await this.notificationsSettingsRepository.findOne({
      where: { id },
    });

    return NotificationsSettingsTransformer.fromEntity(entity);
  }
}
