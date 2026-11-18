import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { emailIgnoringCase } from './email-where';
import { RegularUserEntity } from '../entities/user.entity';
import { IRegularUserRepository } from '../interfaces/regular-user-repository.interface';
import {
  CreateRegularUserOptions,
  FindRegularUserOptions,
  IRegularUserModel,
  RegularUserTransformer,
  UpdateRegularUserOptions,
} from '../models/regular-user.model';

@Injectable()
export class RegularUserRepositoryService implements IRegularUserRepository {
  constructor(
    @InjectRepository(RegularUserEntity)
    private readonly regularUserRepository: Repository<RegularUserEntity>,
  ) {}

  public async update(
    id: string,
    updateUserModel: UpdateRegularUserOptions,
  ): Promise<IRegularUserModel> {
    const userToUpdate = await this.regularUserRepository.preload({
      id,
      ...updateUserModel,
    });

    await this.regularUserRepository.save(userToUpdate);

    return this.find({ id });
  }

  async create(
    userModel: CreateRegularUserOptions,
  ): Promise<IRegularUserModel> {
    const newUserEntity = await this.regularUserRepository.save(
      RegularUserTransformer.toEntity(userModel),
    );

    return this.find({ id: newUserEntity.id });
  }

  async find(options: FindRegularUserOptions): Promise<IRegularUserModel> {
    const userEntity = await this.regularUserRepository.findOne({
      where: emailIgnoringCase(options) as FindOptionsWhere<RegularUserEntity>,
      relations: {
        location: {
          county: true,
        },
        activeOrganization: {
          volunteers: true,
        },
        notificationsSettings: true,
      },
    });

    return userEntity ? RegularUserTransformer.fromEntity(userEntity) : null;
  }

  async markNewsSeen(id: string): Promise<void> {
    // the database clock, the one that stamps the news (created_on)
    await this.regularUserRepository.update(id, {
      newsLastSeenAt: () => 'now()',
    });
  }
}
