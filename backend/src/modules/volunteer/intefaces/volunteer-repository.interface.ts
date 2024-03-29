import { IRepositoryWithPagination } from 'src/common/interfaces/repository-with-pagination.interface';
import { Pagination } from 'src/infrastructure/base/repository-with-pagination.class';
import { VolunteerEntity } from '../entities/volunteer.entity';
import {
  CreateVolunteerProfileOptions,
  IVolunteerProfileModel,
  UpdateVolunteerProfileOptions,
} from '../model/volunteer-profile.model';
import {
  CountVolunteerOptions,
  CreateVolunteerOptions,
  FindManyVolunteersOptions,
  IVolunteerModel,
  UpdateVolunteerOptions,
  FindVolunteerOptions,
  IVolunteerStats,
} from '../model/volunteer.model';

export interface IVolunteerRepository
  extends IRepositoryWithPagination<VolunteerEntity> {
  create(newVolunteer: CreateVolunteerOptions): Promise<IVolunteerModel>;
  update(updates: UpdateVolunteerOptions): Promise<IVolunteerModel>;
  findMany(
    findOptions: FindManyVolunteersOptions,
  ): Promise<Pagination<IVolunteerModel>>;
  findAllActiveByDepartmentIds(
    organizationId: string,
    departmentIds?: string[],
  ): Promise<IVolunteerModel[]>;
  count(options: CountVolunteerOptions): Promise<number>;
  findAll(options: FindVolunteerOptions): Promise<IVolunteerModel[]>;
  findVolunteerWithOngStats(volunteerId: string): Promise<IVolunteerStats>;
}

export interface IVolunteerProfileRepository {
  create(
    newProfile: CreateVolunteerProfileOptions,
  ): Promise<IVolunteerProfileModel>;
  find(id: string): Promise<IVolunteerProfileModel>;
  update(
    id: string,
    updates: UpdateVolunteerProfileOptions,
  ): Promise<IVolunteerProfileModel>;
}
