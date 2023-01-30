import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../entities/user.entity';
import { IUserRepository } from '../interfaces/user-repository.interface';
import { IUserModel } from '../models/user.model';

@Injectable()
export class UserRepositoryService implements IUserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  create(userModel: Omit<IUserModel, 'id'>): Promise<IUserModel> {
    throw new Error('Method not implemented.');
  }

  findById(id: string): Promise<IUserModel> {
    throw new Error('Method not implemented.');
  }
}
