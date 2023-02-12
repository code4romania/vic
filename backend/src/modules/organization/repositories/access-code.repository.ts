import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccessCodeEntity } from '../entities/access-code.entity';
import { IAccessCodeRepository } from '../interfaces/access-code-repository.interface';
import {
  AccessCodeTransformer,
  IAccessCodeModel,
  ICreateAccessCodeModel,
  IFindAccessCodeModel,
  IFindAllAccessCodeModel,
  IUpdateAccessCodeModel,
} from '../models/access-code.model';

@Injectable()
export class AccessCodeRepositoryService implements IAccessCodeRepository {
  constructor(
    @InjectRepository(AccessCodeEntity)
    private readonly accessCodeRepository: Repository<AccessCodeEntity>,
  ) {}

  async create(
    newAccessCode: ICreateAccessCodeModel,
  ): Promise<IAccessCodeModel> {
    const accessCode = await this.accessCodeRepository.save(
      AccessCodeTransformer.toEntity(newAccessCode),
    );

    return this.find({ id: accessCode.id });
  }

  async update({
    id,
    ...updates
  }: IUpdateAccessCodeModel): Promise<IAccessCodeModel> {
    await this.accessCodeRepository.update({ id }, { ...updates });

    return this.find({ id });
  }

  async find(findOptions: IFindAccessCodeModel): Promise<IAccessCodeModel> {
    const accessCodeEntity = await this.accessCodeRepository.findOne({
      where: { ...findOptions },
      relations: {
        createdBy: true,
      },
    });

    return accessCodeEntity
      ? AccessCodeTransformer.fromEntity(accessCodeEntity)
      : null;
  }

  async findAll(
    findOptions: IFindAllAccessCodeModel /* INSERT FILTERING OPTIONS */,
  ): Promise<IAccessCodeModel[]> {
    const accessCodeEntities = await this.accessCodeRepository.find({
      where: { ...findOptions },
      relations: {
        createdBy: true,
      },
    });

    return accessCodeEntities.map(AccessCodeTransformer.fromEntity);
  }

  async delete(id: string): Promise<IAccessCodeModel> {
    const accessCodeEntity = await this.accessCodeRepository.findOneBy({ id });

    if (accessCodeEntity) {
      const removed = await this.accessCodeRepository.remove(accessCodeEntity);
      return AccessCodeTransformer.fromEntity(removed);
    }

    return null;
  }
}
