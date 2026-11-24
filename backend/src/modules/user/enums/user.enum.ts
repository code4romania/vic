export enum UserType {
  ADMIN = 'admin',
  REGULAR = 'regular',
}

// The language of the apps, the push notifications and the emails. Null on a user = not chosen yet:
// emails go out in both languages, push notifications in Romanian.
export enum Language {
  RO = 'ro',
  EN = 'en',
}

export const DEFAULT_LANGUAGE = Language.RO;

export enum SEX {
  MALE = 'male',
  FEMALE = 'female',
}
