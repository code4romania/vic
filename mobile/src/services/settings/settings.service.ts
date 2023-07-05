import { useMutation } from 'react-query';
import { ISettingsUpdatesPayload, updateSettings } from './settings.api';

export const useUpdateSettingsMutation = () => {
  return useMutation(
    ['update-settings'],
    ({ id, settings }: { id: string; settings: ISettingsUpdatesPayload }) => {
      return updateSettings(id, settings);
    },
  );
};
