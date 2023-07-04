import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { INotificationsSettingsRepository } from '../interfaces/notifications-settings-respository.interface';
import { NotificationsSettingsEntity } from '../entities/notifications-settings.entity';
import {
  ICreateNotificationsSettingsOptions,
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

  public async create(
    createNotiicationsSettings: ICreateNotificationsSettingsOptions,
  ): Promise<INotificationsSettingsModel> {
    const settings = await this.notificationsSettingsRepository.save(
      NotificationsSettingsTransformer.toEntity(createNotiicationsSettings),
    );

    return this.find(settings.userId);
  }

  public async update(
    userId: string,
    updates: IUpdateNotificationsSettingsOptions,
  ): Promise<INotificationsSettingsModel> {
    const toUpdate = await this.notificationsSettingsRepository.preload({
      userId,
      ...updates,
    });

    if (!toUpdate) return null;

    await this.notificationsSettingsRepository.save(toUpdate);

    return this.find(userId);
  }

  public async find(userId: string): Promise<INotificationsSettingsModel> {
    const entity = await this.notificationsSettingsRepository.findOne({
      where: { userId },
    });

    return NotificationsSettingsTransformer.fromEntity(entity);
  }
}
