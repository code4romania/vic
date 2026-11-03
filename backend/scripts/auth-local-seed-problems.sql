-- LOCAL ONLY. Rows that scripts/auth-preflight.sql must catch, one per check.
-- Never run this against staging or production.
--
-- Use it to prove the pre-flight and the migration guard work:
--   1. load auth-local-seed.sql, then this file;
--   2. scripts/auth-preflight.sql reports every row below;
--   3. the OwnAuthTables migration fails on user_type_email_unique (check 1) and rolls back;
--   4. scripts/auth-local-seed-problems-undo.sql removes these rows again.
--
--   docker exec -i vic-own-auth-db psql -U postgres -d vic -v ON_ERROR_STOP=1 < scripts/auth-local-seed-problems.sql

BEGIN;

-- Check 4: organizations that collide ignoring case.
INSERT INTO organization (id, name, email, phone)
VALUES
  ('00000000-0000-4000-a000-0000000000f1', 'ASOCIATIA SEED UNU', 'CONTACT@SEED-UNU.TEST', '+40700000001 ')
ON CONFLICT (id) DO NOTHING;

INSERT INTO "user" (id, type, cognito_id, name, email, phone, organization_id, first_name, last_name)
VALUES
  -- Check 1: same volunteer email as elena@seed.test, different case and Cognito user.
  ('00000000-0000-4000-c000-0000000000f1', 'regular', '22222222-2222-4222-8222-0000000000f1', 'Elena Dublura', 'Elena@Seed.test', '+40720000099', NULL, 'Elena', 'Dublura'),
  -- Check 2: admin with no organization.
  ('00000000-0000-4000-b000-0000000000f2', 'admin', '11111111-1111-4111-8111-0000000000f2', 'Orfan Admin', 'orfan.admin@seed.test', '+40710000098', NULL, NULL, NULL),
  -- Check 3: email with surrounding spaces, and one with no '@'.
  ('00000000-0000-4000-c000-0000000000f3', 'regular', '22222222-2222-4222-8222-0000000000f3', 'Spatiu Voluntar', ' spatiu@seed.test ', '+40720000097', NULL, 'Spatiu', 'Voluntar'),
  ('00000000-0000-4000-c000-0000000000f4', 'regular', '22222222-2222-4222-8222-0000000000f4', 'Fara Arond', 'fara-arond.seed.test', '+40720000096', NULL, 'Fara', 'Arond')
ON CONFLICT (id) DO NOTHING;

COMMIT;
