export const REGEX = {
  COGNITO_PASSWORD:
    /^(?!\s+)(?!.*\s+$)(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[$^*.[\]{}()?"!@#%&/\\,><':;|_~`=+\- ])[A-Za-z0-9$^*.[\]{}()?"!@#%&/\\,><':;|_~`=+\- ]{8,256}$/,
  NUMBERS_ONLY: /^[0-9]*$/,
  STRINGS_ONLY: /^[a-zA-Z]+$/,
};

export const CONSTANTS = {
  PHONE_PREFIX: '+40',
  MINIMAL_AGE: 18,
  OTHER_OPTION: 'other',
};

export const ALLOW_FONT_SCALLING = false;

export const MIME_TYPES: any = {
  doc: 'application/msword',
  ['docx']: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ['pdf']: 'application/pdf',
};
