import { ICity } from '../../common/interfaces/city.interface';
import { ICounty } from '../../common/interfaces/county.interface';
import API from '../api';

export const getCities = async (search: string): Promise<ICity[]> => {
  return API.get(`/location/city?search=${search}`).then((res) => res.data);
};

export const getCounties = async (): Promise<ICounty[]> => {
  return API.get(`/location/county`).then((res) => res.data);
};
