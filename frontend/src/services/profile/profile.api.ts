import API from '../api';

export const getUserProfile = async () => {
  return API.get('user').then((res) => res.data);
};
