import { FindOperator, Raw } from 'typeorm';

// Emails are unique per user type ignoring case (UNIQUE (type, lower(email))), so a lookup by email ignores
// case too (#675). Stored emails can keep the case people typed ("Andrei.manda@…") while logins and imports
// lowercase theirs; an exact match missed the person and the insert that followed hit the unique index.
export function emailIgnoringCase<T extends { email?: unknown }>(
  where: T | T[],
): T | T[] {
  const one = (options: T, index: number): T =>
    typeof options?.email === 'string'
      ? {
          ...options,
          email: Raw((column) => `LOWER(${column}) = LOWER(:email_${index})`, {
            [`email_${index}`]: options.email,
          }) as FindOperator<string>,
        }
      : options;
  return Array.isArray(where) ? where.map(one) : one(where, 0);
}
