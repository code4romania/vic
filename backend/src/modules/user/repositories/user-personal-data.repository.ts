import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IUserPersonalDataRepository } from '../interfaces/user-personal-data-repository.interface';
import { UserPersonalDataEntity } from '../entities/user-personal-data.entity';
import {
  CreateUserPersonalDataOptions,
  IUserPersonalDataModel,
  UserPersonalDataTransformer,
} from '../models/user-personal-data.model';

@Injectable()
export class UserPersonalDataRepository implements IUserPersonalDataRepository {
  constructor(
    @InjectRepository(UserPersonalDataEntity)
    private readonly userPersonalDataRepository: Repository<UserPersonalDataEntity>,
  ) {}

  public async create(
    userPersonalDataModel: CreateUserPersonalDataOptions,
  ): Promise<IUserPersonalDataModel> {
    const newUserPersonalDataEntity =
      await this.userPersonalDataRepository.save(
        UserPersonalDataTransformer.toEntity(userPersonalDataModel),
      );

    return this.find(newUserPersonalDataEntity.id);
  }

  public async update(
    id: string,
    userPersonalDataModel: Partial<CreateUserPersonalDataOptions>,
  ): Promise<IUserPersonalDataModel> {
    const toUpdate = await this.userPersonalDataRepository.preload({
      id,
      ...userPersonalDataModel,
    });
    await this.userPersonalDataRepository.save(toUpdate);

    return this.find(id);
  }

  async find(id: string): Promise<IUserPersonalDataModel> {
    const userPersonalDataEntity =
      await this.userPersonalDataRepository.findOne({
        where: { id },
      });

    return UserPersonalDataTransformer.fromEntity(userPersonalDataEntity);
  }
}
