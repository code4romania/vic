export const REGEX = {
  COGNITO_PASSWORD:
    /^(?!\s+)(?!.*\s+$)(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[$^*.[\]{}()?"!@#%&/\\,><':;|_~`=+\- ])[A-Za-z0-9$^*.[\]{}()?"!@#%&/\\,><':;|_~`=+\- ]{8,256}$/,
  NUMBERS_ONLY: /^[0-9]*$/,
};

export const CONSTANTS = {
  PHONE_PREFIX: '+40',
  MINIMAL_AGE: 18,
};
