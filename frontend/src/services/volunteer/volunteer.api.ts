import { Sex } from '../../common/enums/sex.enum';
import { IAccessRequest } from '../../common/interfaces/access-request.interface';
// import API from '../api';

export const getRegistration = async (id: string): Promise<IAccessRequest> => {
  console.log(id);
  return {
    id: '1',
    name: 'Elena MAtei',
    logo: '',
    age: 23,
    sex: Sex.FEMALE,
    location: 'Bucuresti',
    email: 'hahaah',
    phone: '1234567894',
    createdOn: new Date(),
    answers: ['raspuns 1', 'raspuns 2'],
  };
  // return API.get(`/volunteers/access-request/${id}`).then((res) => res.data);
};
