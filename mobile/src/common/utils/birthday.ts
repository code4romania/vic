// A birthday is a calendar day, not an instant. The picker gives local midnight, which in Romania
// is 21:00 or 22:00 UTC of the previous day, so anything that read it in UTC showed one day earlier
// (#584). It is sent as noon UTC of the picked day: the same day in every time zone.
export const birthdayToApi = (date: Date): Date =>
  new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 12));

// Picker bounds: nobody is born in the future, and the calendar opens on a plausible year.
export const BIRTHDAY_MIN = new Date(1920, 0, 1);
export const birthdayMax = (): Date => new Date();
export const BIRTHDAY_INITIAL_VISIBLE = new Date(2000, 0, 1);
