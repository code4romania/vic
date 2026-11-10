import { BadRequestException } from '@nestjs/common';
import { assertSafeOrderBy } from './repository-with-pagination.class';

describe('assertSafeOrderBy', () => {
  it('lets a column or a relation column through', () => {
    for (const column of [
      'name',
      'createdOn',
      'user.name',
      'activityType.name',
    ]) {
      expect(() => assertSafeOrderBy(column)).not.toThrow();
    }
  });

  it('stops anything that is not a plain column path before it reaches ORDER BY', () => {
    for (const payload of [
      'name; DROP TABLE "user"--',
      '(CASE WHEN (SELECT 1)=1 THEN name ELSE email END)',
      'name ASC, (SELECT pg_sleep(5))',
      '"name"',
      'user.name.x',
      'a b',
      '1',
      '',
    ]) {
      expect(() => assertSafeOrderBy(payload)).toThrow(BadRequestException);
    }
  });
});
