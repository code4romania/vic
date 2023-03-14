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
} from '../models/regular-user.model';

@Injectable()
export class RegularUserRepositoryService implements IRegularUserRepository {
  constructor(
    @InjectRepository(RegularUserEntity)
    private readonly regularUserRepository: Repository<RegularUserEntity>,
  ) {}

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
        location: true,
      },
    });

    return userEntity ? RegularUserTransformer.fromEntity(userEntity) : null;
  }
}
