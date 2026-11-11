import React from 'react';
import { act, renderHook } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Sex } from '../../common/enums/sex.enum';
import { NotificationsFrom } from '../../common/enums/notifications-from.enum';
import { IUserProfile } from '../../common/interfaces/user-profile.interface';
import { IOrganizationVolunteer } from '../../common/interfaces/organization-list-item.interface';
import useStore from '../../store/store';
import { hasProfileChanged } from './profile-changes';
import { createUserProfile } from './user.api';
import { useCreateUserProfileMutation } from './user.service';

jest.mock('./user.api', () => ({ createUserProfile: jest.fn() }));

const organization: IOrganizationVolunteer = {
  id: 'org-1',
  name: 'Organization',
  logo: 'logo.png',
  volunteerId: 'volunteer-1',
  volunteerProfileId: null,
  volunteerStatus: 'candidate',
};

const profile: IUserProfile = {
  id: 'user-1',
  email: 'ana@example.com',
  firstName: 'Ana',
  lastName: 'Popescu',
  age: 25,
  sex: Sex.FEMALE,
  activeOrganization: null,
  myOrganizations: [organization],
  notificationsSettings: {
    id: 'settings-1',
    notificationsFrom: NotificationsFrom.ALL_ORGANIZATIONS,
    notificationsViaEmail: true,
    notificationsViaPush: true,
  },
};

describe('hasProfileChanged', () => {
  it.each([null, undefined])('detects a missing previous profile (%s)', (previous) => {
    expect(hasProfileChanged(previous, profile)).toBe(true);
  });

  it('ignores identical relevant fields in new objects', () => {
    expect(hasProfileChanged(profile, { ...profile, myOrganizations: [{ ...organization }] })).toBe(
      false,
    );
  });

  it('ignores changes to unrelated profile fields', () => {
    expect(hasProfileChanged(profile, { ...profile, firstName: 'Maria' })).toBe(false);
  });

  it.each<Partial<IOrganizationVolunteer>>([
    { id: 'org-2' },
    { volunteerStatus: 'active' },
    { volunteerProfileId: 'profile-1' },
    { name: 'New name' },
    { logo: 'new-logo.png' },
  ])('detects organization list changes: %o', (change) => {
    expect(
      hasProfileChanged(profile, {
        ...profile,
        myOrganizations: [{ ...organization, ...change }],
      }),
    ).toBe(true);
  });

  it.each<Partial<IOrganizationVolunteer>>([
    { id: 'org-2' },
    { volunteerId: 'volunteer-2' },
    { volunteerProfileId: 'profile-1' },
    { volunteerStatus: 'inactive' },
  ])('detects active organization changes: %o', (change) => {
    const activeOrganization: IOrganizationVolunteer = {
      ...organization,
      volunteerStatus: 'active',
    };
    expect(
      hasProfileChanged(
        { ...profile, activeOrganization },
        { ...profile, activeOrganization: { ...activeOrganization, ...change } },
      ),
    ).toBe(true);
  });

  it('detects an added organization', () => {
    expect(
      hasProfileChanged(profile, {
        ...profile,
        myOrganizations: [organization, { ...organization, id: 'org-2' }],
      }),
    ).toBe(true);
  });

  it('detects a removed organization', () => {
    expect(hasProfileChanged(profile, { ...profile, myOrganizations: [] })).toBe(true);
  });

  it('ignores organization order', () => {
    const organizations = [organization, { ...organization, id: 'org-2' }];
    expect(
      hasProfileChanged(
        { ...profile, myOrganizations: organizations },
        { ...profile, myOrganizations: [...organizations].reverse() },
      ),
    ).toBe(false);
  });
});

describe('useCreateUserProfileMutation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useStore.setState({ userProfile: null });
  });

  it.each([true, false])(
    'stores returned organizations, falling back when missing (present: %s)',
    async (hasOrganizations) => {
      const response = {
        ...profile,
        myOrganizations: hasOrganizations ? profile.myOrganizations : undefined,
      };
      (createUserProfile as jest.Mock).mockResolvedValue(response);
      const client = new QueryClient({ defaultOptions: { queries: { cacheTime: 0 } } });
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={client}>{children}</QueryClientProvider>
      );
      const { result } = await renderHook(() => useCreateUserProfileMutation(), { wrapper });

      await act(async () => {
        await result.current.mutateAsync({
          firstName: profile.firstName,
          lastName: profile.lastName,
          sex: profile.sex,
        });
      });

      expect(useStore.getState().userProfile).toEqual({
        ...profile,
        myOrganizations: hasOrganizations ? profile.myOrganizations : [],
      });
      client.clear();
    },
  );
});
