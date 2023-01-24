import { useQuery } from 'react-query';
import { getTestValues } from './test.api';

export const useTestValuesQuery = () => useQuery(['test-values'], () => getTestValues());
