import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IUserPersonalDataRepository } from '../interfaces/user-personal-data-repository.interface';
import { UserPersonalDataEntity } from '../entities/user-personal-data.entity';
import {
  CreateUserPersonalDataOptions,
  FindUserPersonalDataOptions,
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

    return this.find({ id: newUserPersonalDataEntity.id });
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

    return this.find({ id });
  }

  public async find(
    findOptios: FindUserPersonalDataOptions,
  ): Promise<IUserPersonalDataModel> {
    const userPersonalDataEntity =
      await this.userPersonalDataRepository.findOne({
        where: findOptios,
      });

    return UserPersonalDataTransformer.fromEntity(userPersonalDataEntity);
  }

  public async delete(id: string): Promise<string> {
    const data = await this.userPersonalDataRepository.findOne({
      where: { id },
    });

    if (data) {
      await this.userPersonalDataRepository.remove(data);
      return data.id;
    }

    return null;
  }
}
