import { OrderDirection } from '../enums/sort-direction.enum';

interface IPaginationMeta {
  currentPage: number;
  itemCount: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
  orderByColumn: string;
  orderDirection: OrderDirection;
}

export interface IPaginatedEntity<T> {
  items: T[];
  meta: IPaginationMeta;
}
