import { UserFormTypes } from '../../screens/CreateUser';

const dummyData: UserFormTypes = {
  firstName: 'John',
  lastName: 'Doe',
  city: 'New York',
  county: 'Manhattan',
  birthday: new Date('1990-01-01'),
  sex: 'Male',
};

export const createUserProfile = (userProfile: UserFormTypes): Promise<any> => {
  return Promise.resolve(userProfile);
};

export const getUserProfile = (): Promise<any> => {
  return Promise.resolve(dummyData);
};
