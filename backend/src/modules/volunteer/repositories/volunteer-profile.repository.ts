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
  UpdateVolunteerProfileOptions,
  VolunteerProfileModelTransformer,
} from '../model/volunteer-profile.model';

export class VolunteerProfileRepositoryService
  implements IVolunteerProfileRepository
{
  constructor(
    @InjectRepository(VolunteerProfileEntity)
    private readonly volunteerProfileRepository: Repository<VolunteerProfileEntity>,
    @InjectRepository(VolunteerEntity)
    private readonly volunteerRepository: Repository<VolunteerEntity>,
  ) {}

  async update({
    id,
    ...updates
  }: UpdateVolunteerProfileOptions): Promise<IVolunteerProfileModel> {
    await this.volunteerProfileRepository.update({ id }, updates);

    return this.find(id);
  }

  async create(
    newProfile: CreateVolunteerProfileOptions,
  ): Promise<IVolunteerProfileModel> {
    const profile = await this.volunteerProfileRepository.save(
      VolunteerProfileModelTransformer.toEntity(newProfile),
    );

    // Update Volunteer with the volunteerProfileId
    await this.volunteerRepository.update(
      { id: newProfile.volunteerId },
      { volunteerProfileId: profile.id },
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
