import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VolunteerProfileEntity } from '../entities/volunteer-profile.entity';
import { VolunteerEntity } from '../entities/volunteer.entity';
import { IVolunteerProfileRepository } from '../intefaces/volunteer-repository.interface';
import {
  CreateVolunteerProfileOptions,
  IVolunteerProfileModel,
  UpdateVolunteerProfileOptions,
  VolunteerProfileModelTransformer,
} from '../model/volunteer-profile.model';
import { VolunteerRepositoryService } from './volunteer.repository';

export class VolunteerProfileRepositoryService
  implements IVolunteerProfileRepository
{
  constructor(
    @InjectRepository(VolunteerProfileEntity)
    private readonly volunteerProfileRepository: Repository<VolunteerProfileEntity>,
    private readonly volunteerRepositoryService: VolunteerRepositoryService,
  ) {}

  async update(
    id: string,
    updates: UpdateVolunteerProfileOptions,
  ): Promise<IVolunteerProfileModel> {
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
    await this.volunteerRepositoryService.update({
      id: newProfile.volunteerId,
      volunteerProfileId: profile.id,
    });

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

  async delete(id: string): Promise<void> {
    await this.volunteerProfileRepository.delete(id);
  }
}
