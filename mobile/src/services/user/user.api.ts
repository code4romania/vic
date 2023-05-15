import { Auth } from 'aws-amplify';
import { UserFormTypes } from '../../screens/CreateUser';
import API from '../api';

const dummyData: UserFormTypes = {
  firstName: 'John',
  lastName: 'Doe',
  city: 'New York',
  county: 'Manhattan',
  birthday: new Date('1990-01-01'),
  sex: 'Male',
};

export const createUserProfile = async (userProfile: UserFormTypes): Promise<any> => {
  console.log('userProfile', userProfile);
  const user = await Auth.currentAuthenticatedUser();
  return API.post('/mobile/user', {
    ...dummyData,
    sex: 'male',
    locationId: 1,
    email: user.attributes.email,
    phone: user.attributes.phone_number,
    cognitoId: user.username,
  }).then((res) => res.data);
};

export const getUserProfile = (): Promise<any> => {
  return Promise.resolve(dummyData);
};
