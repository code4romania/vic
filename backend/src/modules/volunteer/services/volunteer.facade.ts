import { Injectable } from '@nestjs/common';
import { Pagination } from 'src/infrastructure/base/repository-with-pagination.class';
import { VolunteerStatus } from '../enums/volunteer-status.enum';
import {
  CreateVolunteerProfileOptions,
  IVolunteerProfileModel,
  UpdateVolunteerProfileOptions,
} from '../model/volunteer-profile.model';
import {
  CountVolunteerOptions,
  CreateVolunteerOptions,
  FindManyVolunteersOptions,
  FindVolunteerOptions,
  IVolunteerModel,
  IVolunteerStats,
  UpdateVolunteerOptions,
} from '../model/volunteer.model';
import { VolunteerProfileRepositoryService } from '../repositories/volunteer-profile.repository';
import { VolunteerRepositoryService } from '../repositories/volunteer.repository';

@Injectable()
export class VolunteerFacade {
  constructor(
    private readonly volunteerRepository: VolunteerRepositoryService,
    private readonly volunteerProfileRepositoryService: VolunteerProfileRepositoryService,
  ) {}

  public create(
    createVolunteerOptions: CreateVolunteerOptions,
  ): Promise<IVolunteerModel> {
    return this.volunteerRepository.create(createVolunteerOptions);
  }

  public find(options: FindVolunteerOptions): Promise<IVolunteerModel> {
    return this.volunteerRepository.find(options);
  }

  public findMany(
    options: FindManyVolunteersOptions,
  ): Promise<Pagination<IVolunteerModel>> {
    return this.volunteerRepository.findMany(options);
  }

  async findAllActiveByDepartmentIds(
    organizationId: string,
    targetIds?: string[],
  ): Promise<IVolunteerModel[]> {
    return this.volunteerRepository.findAllActiveByDepartmentIds(
      organizationId,
      targetIds,
    );
  }

  public archive(
    options: Pick<UpdateVolunteerOptions, 'id' | 'archivedById'>,
  ): Promise<IVolunteerModel> {
    return this.volunteerRepository.update({
      id: options.id,
      archivedById: options.archivedById,
      archivedOn: new Date(),
      status: VolunteerStatus.ARCHIVED,
    });
  }

  public block(
    options: Pick<UpdateVolunteerOptions, 'id' | 'blockedById'>,
  ): Promise<IVolunteerModel> {
    return this.volunteerRepository.update({
      id: options.id,
      blockedById: options.blockedById,
      blockedOn: new Date(),
      status: VolunteerStatus.BLOCKED,
    });
  }

  public activate(id: string): Promise<IVolunteerModel> {
    return this.volunteerRepository.update({
      id,
      archivedById: null,
      archivedOn: null,
      blockedById: null,
      blockedOn: null,
      status: VolunteerStatus.ACTIVE,
    });
  }

  async createProfile(
    newProfile: CreateVolunteerProfileOptions,
  ): Promise<IVolunteerProfileModel> {
    return this.volunteerProfileRepositoryService.create(newProfile);
  }

  async findProfile(id: string): Promise<IVolunteerProfileModel> {
    return this.volunteerProfileRepositoryService.find(id);
  }

  async updateProfile(
    id: string,
    updates: UpdateVolunteerProfileOptions,
  ): Promise<IVolunteerProfileModel> {
    return this.volunteerProfileRepositoryService.update(id, updates);
  }

  async count(options: CountVolunteerOptions): Promise<number> {
    return this.volunteerRepository.count(options);
  }

  async findAll(options: FindVolunteerOptions): Promise<IVolunteerModel[]> {
    return this.volunteerRepository.findAll(options);
  }

  async findVolunteerWithOngStats(
    volunteerId: string,
  ): Promise<IVolunteerStats> {
    return this.volunteerRepository.findVolunteerWithOngStats(volunteerId);
  }

  async deleteProfile(id: string): Promise<void> {
    return this.volunteerProfileRepositoryService.delete(id);
  }

  async softDeleteManyAndProfiles(
    userId: string,
  ): Promise<{ deletedProfiles: string[]; deletedVolunteers: string[] }> {
    return this.volunteerRepository.softDeleteManyAndProfiles(userId);
  }
}
