import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
      where: options,
      relations: {
        location: {
          county: true,
        },
        userPersonalData: true,
        activeOrganization: {
          volunteers: true,
        },
      },
    });

    return userEntity ? RegularUserTransformer.fromEntity(userEntity) : null;
  }
}
