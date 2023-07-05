import { Injectable } from '@nestjs/common';
import { IPushTokensRepository } from '../interfaces/push-tokens-repository.interface';
import {
  CreatePushTokenOptions,
  DeletePushTokenOptions,
  IPushTokenModel,
  PushTokenModelTransformer,
} from '../models/push-token.model';
import { PushTokensEntity } from '../entities/push-tokens.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

@Injectable()
export class PushTokensRepository implements IPushTokensRepository {
  constructor(
    @InjectRepository(PushTokensEntity)
    private readonly pushTokensRepository: Repository<PushTokensEntity>,
  ) {}

  async find(findOptions: Partial<IPushTokenModel>): Promise<IPushTokenModel> {
    const entity = await this.pushTokensRepository.findOne({
      where: findOptions,
    });

    return PushTokenModelTransformer.fromEntity(entity);
  }

  async findByUserIds(userIds: string[]): Promise<string[]> {
    const tokens = await this.pushTokensRepository.find({
      select: ['token'],
      where: {
        userId: In(userIds),
      },
    });
    return tokens.map(({ token }) => token);
  }

  async findMany(
    findOptions: Partial<IPushTokenModel>,
  ): Promise<IPushTokenModel[]> {
    const entities = await this.pushTokensRepository.find({
      where: findOptions,
    });

    return entities.map(PushTokenModelTransformer.fromEntity);
  }

  async update(
    id: string,
    updates: Partial<IPushTokenModel>,
  ): Promise<IPushTokenModel> {
    const toUpdate = await this.pushTokensRepository.preload({
      id,
      ...updates,
    });

    if (!toUpdate) return null;

    const updated = await this.pushTokensRepository.save(toUpdate);

    return this.find({ id: updated.id });
  }

  async create(
    createPushToken: CreatePushTokenOptions,
  ): Promise<IPushTokenModel> {
    const token = await this.pushTokensRepository.save(
      PushTokenModelTransformer.toEntity(createPushToken),
    );

    return this.find({ id: token.id });
  }

  async delete(options: DeletePushTokenOptions): Promise<string> {
    const token = await this.pushTokensRepository.findOne({ where: options });

    if (token) {
      await this.pushTokensRepository.remove(token);
      return token.id;
    }

    return null;
  }
}
