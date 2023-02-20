import {
  CreateActivityTypeOptions,
  IActivityType,
} from '../models/activity-type.model';

export interface IActivityTypeRepository {
  create(newActivityType: CreateActivityTypeOptions): Promise<IActivityType>;
  //   update(updates: IUpdateAccessCodeModel): Promise<IActivityType>;
  //   find(options: IFindAccessCodeModel): Promise<IActivityType>;
  //   delete(id: string): Promise<string>;
}
