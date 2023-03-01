import { IRepositoryWithPagination } from 'src/common/interfaces/repository-with-pagination.interface';
import { VolunteerEntity } from '../entities/volunteer.entity';
import {
  CreateVolunteerProfileOptions,
  IVolunteerProfileModel,
  UpdateVolunteerProfileOptions,
} from '../model/volunteer-profile.model';
import {
  CreateVolunteerOptions,
  IVolunteerModel,
  UpdateVolunteerOptions,
} from '../model/volunteer.model';

export interface IVolunteerRepository
  extends IRepositoryWithPagination<VolunteerEntity> {
  create(newVolunteer: CreateVolunteerOptions): Promise<IVolunteerModel>;
  update(updates: UpdateVolunteerOptions): Promise<IVolunteerModel>;
}

export interface IVolunteerProfileRepository {
  create(
    newProfile: CreateVolunteerProfileOptions,
  ): Promise<IVolunteerProfileModel>;
  find(id: string): Promise<IVolunteerProfileModel>;
  update(
    updates: UpdateVolunteerProfileOptions,
  ): Promise<IVolunteerProfileModel>;
}