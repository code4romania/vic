import { useQuery } from 'react-query';
import { DivisionType } from '../../components/Divisions';
import { getDivisionData, getTestValues } from './test.api';

export const useTestValuesQuery = () => useQuery(['test-values'], () => getTestValues());

export const useDivisionDataQuery = (divisionType: DivisionType) =>
  useQuery(['divisions', divisionType], () => getDivisionData(divisionType));
