// The +40 prefix is rendered separately; forms and validation hold the nine national digits.
export const normalizePhoneNumber = (value: string): string => value.replace(/^0/, '');
