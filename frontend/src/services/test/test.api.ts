import { DivisionType } from '../../components/Divisions';
import API from '../api';

export const getTestValues = async () => {
  return API.get('anything').then((res) => res.data);
};

export const getDivisionData = async (divisionType: DivisionType) => {
  return API.get(`divisions?type=${divisionType}`).then((res) => res.data);
};
