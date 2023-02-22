import {
  CreateActivityTypeOptions,
  FindActivityTypeOptions,
  FindManyActivityTypeOptions,
  IActivityTypeModel,
  UpdateActivityTypeOptions,
} from '../models/activity-type.model';

export interface IActivityTypeRepository {
  create(
    newActivityType: CreateActivityTypeOptions,
  ): Promise<IActivityTypeModel>;
  update(updates: UpdateActivityTypeOptions): Promise<IActivityTypeModel>;
  find(options: FindActivityTypeOptions): Promise<IActivityTypeModel>;
  findAll(options: FindManyActivityTypeOptions): Promise<IActivityTypeModel[]>;
}
