import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../entities/user.entity';
import { IUserRepository } from '../interfaces/user-repository.interface';
import { IUserModel, UserTransformer } from '../models/user.model';

@Injectable()
export class UserRepositoryService implements IUserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  public async findByOptions(
    options: Partial<IUserModel>,
  ): Promise<IUserModel> {
    // retrieve user by cognito id
    const userEntity = await this.userRepository.findOne({
      where: options,
    });

    // return user model
    return userEntity ? UserTransformer.fromEntity(userEntity) : null;
  }
}
