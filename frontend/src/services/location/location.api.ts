import { ICity } from '../../common/interfaces/city.interface';
import { ICounty } from '../../common/interfaces/county.interface';
import { IPaginationMeta } from '../../common/interfaces/paginated-entity.interface';
import API from '../api';

interface IGetCitiesResponse {
  items: ICity[];
  meta: IPaginationMeta;
}

export const getCities = async (params: {
  search?: string;
  city?: string;
  county?: string;
  page?: number;
  limit?: number;
}): Promise<IGetCitiesResponse> => {
  return API.get(`/location/city`, { params }).then((res) => res.data);
};

export const getCounties = async (): Promise<ICounty[]> => {
  return API.get(`/location/county`).then((res) => res.data);
};
