import { IAccessRequest } from '../../pages/RegistrationRequests';
// import API from '../api';

export const getRegistrationRequests = async (status: string): Promise<IAccessRequest[]> => {
  // return API.get('/volunteers/registration-requests', { params: { status } }).then(
  //   (res) => res.data,
  // );
  console.log(status);
  return Promise.resolve([
    {
      id: '1',
      logo: 'logo.svg',
      name: 'John Doe',
      email: 'johndoe@example.com',
      phone: '555-555-1234',
      createdOn: '2022-01-01',
    },
    {
      id: '2',
      logo: 'logo.svg',
      name: 'Jane Doe',
      email: 'janedoe@example.com',
      phone: '555-555-5678',
      createdOn: '2022-02-01',
    },
    {
      id: '3',
      logo: 'logo.svg',
      name: 'John Smith',
      email: 'johnsmith@example.com',
      phone: '555-555-9012',
      createdOn: '2022-03-01',
    },
    {
      id: '4',
      logo: 'logo.svg',
      name: 'Jane Smith',
      email: 'janesmith@example.com',
      phone: '555-555-3456',
      createdOn: '2022-04-01',
    },
    {
      id: '5',
      logo: 'logo.svg',
      name: 'Robert Johnson',
      email: 'robertjohnson@example.com',
      phone: '555-555-7890',
      createdOn: '2022-05-01',
    },
    {
      id: '6',
      logo: 'logo.svg',
      name: 'Rachel Johnson',
      email: 'racheljohnson@example.com',
      phone: '555-555-2345',
      createdOn: '2022-06-01',
    },
  ]);
};
