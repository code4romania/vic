import { InjectRepository } from '@nestjs/typeorm';
import { RepositoryWithPagination } from 'src/infrastructure/base/repository-with-pagination.class';
import { Repository } from 'typeorm';
import { VolunteerProfileEntity } from '../entities/volunteer-profile.entity';
import { VolunteerEntity } from '../entities/volunteer.entity';
import {
  IVolunteerProfileRepository,
  IVolunteerRepository,
} from '../intefaces/volunteer-repository.interface';
import {
  CreateVolunteerProfileOptions,
  IVolunteerProfileModel,
  VolunteerProfileModelTransformer,
} from '../model/volunteer-profile.model';

export class VolunteerProfileRepositoryService
  implements IVolunteerProfileRepository
{
  constructor(
    @InjectRepository(VolunteerProfileEntity)
    private readonly volunteerProfileRepository: Repository<VolunteerProfileEntity>,
  ) {}

  async create(
    newProfile: CreateVolunteerProfileOptions,
  ): Promise<IVolunteerProfileModel> {
    const profile = await this.volunteerProfileRepository.save(
      VolunteerProfileModelTransformer.toEntity(newProfile),
    );

    return this.find(profile.id);
  }

  async find(id: string): Promise<IVolunteerProfileModel> {
    const profile = await this.volunteerProfileRepository.findOne({
      where: { id },
      relations: {
        branch: true,
        department: true,
        role: true,
      },
    });

    return VolunteerProfileModelTransformer.fromEntity(profile);
  }
}
