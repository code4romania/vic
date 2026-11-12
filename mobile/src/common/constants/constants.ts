export const REGEX = {
  PASSWORD:
    /^(?!\s+)(?!.*\s+$)(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[$^*.[\]{}()?"!@#%&/\\,><':;|_~`=+\- ])[A-Za-z0-9$^*.[\]{}()?"!@#%&/\\,><':;|_~`=+\- ]{8,256}$/,
  NUMBERS_ONLY: /^[0-9]*$/,
  STRINGS_ONLY: /^[a-zA-Z]+$/,
};

export const CONSTANTS = {
  PHONE_PREFIX: '+40',
  MINIMAL_AGE: 18,
  OTHER_OPTION: 'other',
};

// The legacy (UI Kitten) screens keep a fixed size: their layouts break when the text grows.
export const ALLOW_FONT_SCALLING = false;

// Text follows the system text size, up to the „Îndrăzneț” caps (fontScaleCap in design/tokens):
// titles stop at 1.15×, text at 1.35×.
export const MAX_FONT_SCALE = { title: 1.15, text: 1.35 } as const;

export const MIME_TYPES: any = {
  doc: 'application/msword',
  ['docx']: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ['pdf']: 'application/pdf',
};
