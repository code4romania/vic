import { IVolunteer } from '../../common/interfaces/volunteer.interface';

export const volunteerSlice = (set: any) => ({
  volunteer: undefined,
  setVolunteer: (volunteer: IVolunteer) => {
    set({ volunteer: { ...volunteer } });
  },
});

export default { volunteerSlice };
