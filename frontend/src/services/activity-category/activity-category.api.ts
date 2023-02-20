import API from '../api';
import { IActivityCategory } from '../../pages/ActivityCategories';
// import { CategoryStatus } from '../../pages/ActivityCategories';

export const getActivityCategories = async (): Promise<IActivityCategory[]> => {
  return API.get('/activity-categories').then((res) => res.data);
  // return Promise.resolve([
  //   {
  //     id: '1',
  //     name: 'Outdoor',
  //     icon: 'outdoor.svg',
  //     role: 'Activity Organizer',
  //     department: 'Recreation',
  //     branch: 'Parks and Recreation',
  //     status: CategoryStatus.ACTIVE,
  //   },
  //   {
  //     id: '2',
  //     name: 'Indoor',
  //     icon: 'indoor.svg',
  //     role: 'Activity Organizer',
  //     department: 'Recreation',
  //     branch: 'Parks and Recreation',
  //     status: CategoryStatus.ACTIVE,
  //   },
  //   {
  //     id: '3',
  //     name: 'Music',
  //     icon: 'music.svg',
  //     role: 'Activity Organizer',
  //     department: 'Arts and Culture',
  //     branch: 'Community Center',
  //     status: CategoryStatus.ACTIVE,
  //   },
  //   {
  //     id: '4',
  //     name: 'Dance',
  //     icon: 'dance.svg',
  //     role: 'Activity Organizer',
  //     department: 'Arts and Culture',
  //     branch: 'Community Center',
  //     status: CategoryStatus.DISABLED,
  //   },
  //   {
  //     id: '5',
  //     name: 'Sports',
  //     icon: 'sports.svg',
  //     role: 'Activity Organizer',
  //     department: 'Recreation',
  //     branch: 'Parks and Recreation',
  //     status: CategoryStatus.ACTIVE,
  //   },
  // ]);
};
