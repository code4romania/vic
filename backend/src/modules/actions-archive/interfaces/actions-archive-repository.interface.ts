import { Pagination } from 'src/infrastructure/base/repository-with-pagination.class';
import {
  FindManyActionsArchiveOptions,
  IActionArchiveModel,
} from '../models/actions-archive.model';

export interface IActionArchiveRepository {
  findMany(
    findOptions: FindManyActionsArchiveOptions,
  ): Promise<Pagination<IActionArchiveModel>>;
}
