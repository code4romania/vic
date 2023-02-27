import { OrderDirection } from 'src/common/enums/order-direction.enum';

export interface IBasePaginationFilterModel {
  limit: number;
  page: number;
  search?: string;
  orderBy?: string;
  start?: Date;
  end?: Date;
  orderDirection?: OrderDirection;
}
