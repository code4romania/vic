import { Pagination } from 'src/infrastructure/base/repository-with-pagination.class';
import {
  FindManyActionsArchiveOptions,
  FindManyNewsOptions,
  IActionArchiveModel,
} from '../models/actions-archive.model';

export interface IActionArchiveRepository {
  findMany(
    findOptions: FindManyActionsArchiveOptions,
  ): Promise<Pagination<IActionArchiveModel>>;
  countActivityLogBetweenDates(volunteerIds: string[]): Promise<number>;
  countDocumentStatusUpdatesBetweenDates(
    volunteerIds: string[],
  ): Promise<number>;
  countAccessRequestStatusUpdatesBetweenDates(userId: string): Promise<number>;
  findNews(
    options: Omit<FindManyNewsOptions, 'type'>,
  ): Promise<Pagination<IActionArchiveModel>>;
}
