import API from '../api';

export const getTestValues = async () => {
  return API.get('anything').then((res) => res.data);
};
