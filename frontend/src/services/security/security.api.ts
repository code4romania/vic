import API from '../api';

// VIC 2.0, #508: Setări > Date și securitate
export enum SensitiveAction {
  CHANGE_EMAIL = 'CHANGE_EMAIL',
  DELETE_ORGANIZATION = 'DELETE_ORGANIZATION',
  ADD_ADMIN = 'ADD_ADMIN',
  // #593: downloads of the organization's data
  EXPORT_VOLUNTEERS = 'EXPORT_VOLUNTEERS',
  BACKUP = 'BACKUP',
}

// The emailed code on a GET download (#593)
export const sensitiveCodeHeader = (code: string) => ({ 'X-Sensitive-Code': code });

// Emails a 6-digit code to the admin; the answer names the masked address.
export const requestSensitiveCode = async (
  action: SensitiveAction,
): Promise<{ maskedEmail: string }> =>
  API.post('/security/code', { action }).then((res) => res.data);

// A code to the current address and one to the new address.
export const requestEmailChange = async (
  newEmail: string,
): Promise<{ maskedEmail: string; newEmail: string }> =>
  API.post('/security/email/codes', { newEmail }).then((res) => res.data);

export const confirmEmailChange = async (
  code: string,
  newEmailCode: string,
): Promise<{ email: string }> =>
  API.post('/security/email', { code, newEmailCode }).then((res) => res.data);

export const getBackup = async (code: string): Promise<{ data: Blob; fileName: string }> =>
  API.get('/security/backup', { responseType: 'blob', headers: sensitiveCodeHeader(code) }).then(
    (res) => {
      const disposition = (res.headers['content-disposition'] as string | undefined) ?? '';
      const fileName = /filename="([^"]+)"/.exec(disposition)?.[1] ?? 'VIC-backup.xlsx';
      return { data: res.data, fileName };
    },
  );

export const deleteOrganization = async (confirmation: string, code: string): Promise<void> => {
  await API.post('/security/organization/delete', { confirmation, code });
};
