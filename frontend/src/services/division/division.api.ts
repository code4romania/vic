import { DivisionType } from '../../common/enums/division-type.enum';
import { OrderDirection } from '../../common/enums/order-direction.enum';
import { IDivision, IDivisionListItem } from '../../common/interfaces/division.interface';
import { IPaginatedEntity } from '../../common/interfaces/paginated-entity.interface';
import API from '../api';

export const getDivisions = async (
  limit: number,
  page: number,
  type: DivisionType,
  orderBy?: string,
  orderDirection?: OrderDirection,
): Promise<IPaginatedEntity<IDivision>> => {
  return API.get(`/organization-structure/${type}`, {
    params: { limit, page, orderBy, orderDirection },
  }).then((res) => res.data);
};

type DivisionListPage = IPaginatedEntity<
  Pick<IDivisionListItem, 'id' | 'name' | 'numberOfMembers'>
>;

// The API lists at most 50 per page: the dropdowns need every department / role / branch, so the
// other pages are fetched too and merged into one list.
export const getDivisionsListItems = async (type: DivisionType): Promise<DivisionListPage> => {
  const get = (page: number): Promise<DivisionListPage> =>
    API.get(`/listing/structures/${type}`, { params: { page } }).then((res) => res.data);

  const first = await get(1);
  const totalPages = first.meta?.totalPages ?? 1;
  if (totalPages <= 1) return first;

  const rest = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, index) => get(index + 2)),
  );
  return {
    ...first,
    items: [first, ...rest].flatMap((page) => page.items),
  };
};

export const deleteDivision = async (id: string): Promise<void> => {
  return API.delete(`/organization-structure/${id}`).then((res) => res.data);
};

export const addDivision = async (name: string, type: DivisionType): Promise<IDivision> => {
  return API.post('/organization-structure', {
    name,
    type,
  }).then((res) => res.data);
};

export const editDivision = async (id: string, name: string): Promise<IDivision> => {
  return API.patch(`/organization-structure/${id}`, { name }).then((res) => res.data);
};
