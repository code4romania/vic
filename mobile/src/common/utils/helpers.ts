import { IPaginatedEntity } from '../interfaces/paginated-entity.interface';

export const mapPagesToItems = <T>(pages?: IPaginatedEntity<T>[]): T[] => {
  const items: T[] = [];
  pages?.forEach((page) => items.push(...page.items));
  return items;
};
