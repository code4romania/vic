import { ICity } from '../../common/interfaces/city.interface';
import { ICounty } from '../../common/interfaces/county.interface';
import API from '../api';

export const getCities = async (countyId: number): Promise<ICity[]> => {
  return API.get(`/location/city/${countyId}`).then((res) => res.data);
};

export const getCounties = async (): Promise<ICounty[]> => {
  return API.get('/location/county').then((res) => res.data);
};
