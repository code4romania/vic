import { IRepositoryWithPagination } from 'src/common/interfaces/repository-with-pagination.interface';
import { VolunteerEntity } from '../entities/volunteer.entity';
import {
  CreateVolunteerProfileOptions,
  IVolunteerProfileModel,
} from '../model/volunteer-profile.model';
import {
  CreateVolunteerOptions,
  IVolunteerModel,
} from '../model/volunteer.model';

export interface IVolunteerRepository
  extends IRepositoryWithPagination<VolunteerEntity> {
  create(newVolunteer: CreateVolunteerOptions): Promise<IVolunteerModel>;
}

export interface IVolunteerProfileRepository {
  create(
    newProfile: CreateVolunteerProfileOptions,
  ): Promise<IVolunteerProfileModel>;
  find(id: string): Promise<IVolunteerProfileModel>;
}
