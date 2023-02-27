import { Injectable } from '@nestjs/common';
import { FindRegularUserOptions } from 'src/modules/user/models/regular-user.model';
import {
  CreateVolunteerProfileOptions,
  IVolunteerProfileModel,
} from '../model/volunteer-profile.model';
import {
  CreateVolunteerOptions,
  FindVolunteerOptions,
  IVolunteerModel,
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

  async createProfile(
    newProfile: CreateVolunteerProfileOptions,
  ): Promise<IVolunteerProfileModel> {
    return this.volunteerProfileRepositoryService.create(newProfile);
  }

  async findProfile(id: string): Promise<IVolunteerProfileModel> {
    return this.volunteerProfileRepositoryService.find(id);
  }
}
