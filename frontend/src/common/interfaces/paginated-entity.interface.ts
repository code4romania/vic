import { OrderDirection } from '../enums/order-direction.enum';

export interface IPaginationMeta {
  currentPage: number;
  itemCount: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
  orderByColumn?: string;
  orderDirection?: OrderDirection;
}

export interface IPaginatedEntity<T> {
  items: T[];
  meta: IPaginationMeta;
}
