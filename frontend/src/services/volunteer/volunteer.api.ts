import { Sex } from '../../common/enums/sex.enum';
import { IAccessRequestDetails } from '../../common/interfaces/access-request.interface';
// import API from '../api';

export const getAccessRequest = async (id: string): Promise<IAccessRequestDetails> => {
  console.log('id', id);
  // return API.get(`/volunteers/access-request/${id}`).then((res) => res.data);
  return Promise.resolve({
    id: 'shshhs',
    name: 'Yoyo',
    logo: 'https://plus.unsplash.com/premium_photo-1661692476630-06945685910e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
    age: 16,
    sex: Sex.FEMALE,
    location: 'Iasi, Jud. Iasi',
    email: 'email@email.com',
    phone: '079999999',
    createdOn: new Date(),
    answers: ['Dog ate my homework', 'Cat ate my homework'],
  });
};
