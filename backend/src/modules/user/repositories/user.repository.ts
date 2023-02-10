import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ArrayOfPropetyType } from 'src/common/helpers/typescript-extends';
import { Repository } from 'typeorm';
import { UserEntity } from '../entities/user.entity';
import { IUserRepository } from '../interfaces/user-repository.interface';
import {
  IFindUserModel,
  IUserModel,
  UserTransformer,
} from '../models/user.model';

@Injectable()
export class UserRepositoryService implements IUserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  public async find(
    options: Partial<IFindUserModel> | ArrayOfPropetyType<IFindUserModel>,
  ): Promise<IUserModel> {
    // retrieve user by cognito id
    const userEntity = await this.userRepository.findOne({
      where: options,
    });

    // return user model
    return userEntity ? UserTransformer.fromEntity(userEntity) : null;
  }
}
