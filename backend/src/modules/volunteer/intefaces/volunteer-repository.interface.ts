import { IRepositoryWithPagination } from 'src/common/interfaces/repository-with-pagination.interface';
import { VolunteerEntity } from '../entities/volunteer.entity';
import {
  CreateVolunteerOptions,
  IVolunteerModel,
} from '../model/volunteer.model';

export interface IVolunteerRepository
  extends IRepositoryWithPagination<VolunteerEntity> {
  create(newVolunteer: CreateVolunteerOptions): Promise<IVolunteerModel>;
}
