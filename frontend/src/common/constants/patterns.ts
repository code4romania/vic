export const REGEX = {
  NAME_REGEX: /^(?!.*[ ]{2})[\w-\săîâșțĂÎÂȘȚ]*$/,
};

export const DATE_FORMAT = {
  DD_MM_YY_HH_MM: 'dd.MM.yyyy, HH:mm',
  HH_MM: 'HH:mm',
};

// Same rule as backend/src/common/constants/constants.ts: 8 to 256 characters, upper case,
// lower case, a digit and a symbol, no leading or trailing whitespace.
export const PASSWORD_REGEX =
  /^(?!\s+)(?!.*\s+$)(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[$^*.[\]{}()?"!@#%&/\\,><':;|_~`=+\- ])[A-Za-z0-9$^*.[\]{}()?"!@#%&/\\,><':;|_~`=+\- ]{8,256}$/;
