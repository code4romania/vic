-- LOCAL ONLY. Removes the rows added by auth-local-seed-problems.sql.
--   docker exec -i vic-own-auth-db psql -U postgres -d vic -v ON_ERROR_STOP=1 < scripts/auth-local-seed-problems-undo.sql

BEGIN;

DELETE FROM "user" WHERE id IN (
  '00000000-0000-4000-c000-0000000000f1',
  '00000000-0000-4000-b000-0000000000f2',
  '00000000-0000-4000-c000-0000000000f3',
  '00000000-0000-4000-c000-0000000000f4'
);

DELETE FROM organization WHERE id = '00000000-0000-4000-a000-0000000000f1';

COMMIT;
