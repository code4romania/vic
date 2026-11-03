-- LOCAL ONLY. Seed data for building own auth against the local docker compose database
-- (decision 9, "local first"). Never run this against staging or production.
--
-- Mirrors what production holds before the cutover: NGOs from NGO Hub, admins and volunteers
-- with Cognito usernames, social-style volunteers, someone who is both, a deleted user.
-- The pre-flight (scripts/auth-preflight.sql) returns zero problem rows on this data, and the
-- OwnAuthTables migration must run, revert and run again on it.
-- Rows the pre-flight must catch live in auth-local-seed-problems.sql.
--
-- Idempotent: fixed ids, ON CONFLICT DO NOTHING. Run it before the OwnAuthTables migration:
--   docker exec -i vic-own-auth-db psql -U postgres -d vic -v ON_ERROR_STOP=1 < scripts/auth-local-seed.sql

BEGIN;

INSERT INTO organization (id, name, email, phone, address, activity_area, description)
VALUES
  ('00000000-0000-4000-a000-000000000001', 'Asociatia Seed Unu', 'contact@seed-unu.test', '+40700000001', 'Str. Exemplu 1, Bucuresti', 'Social', 'Seeded NGO, imported from NGO Hub'),
  ('00000000-0000-4000-a000-000000000002', 'Fundatia Seed Doi', 'contact@seed-doi.test', '+40700000002', 'Str. Exemplu 2, Cluj-Napoca', 'Educatie', 'Seeded NGO, imported from NGO Hub')
ON CONFLICT (id) DO NOTHING;

-- Admins (web realm after the migration). Cognito ids are NGO Hub pool usernames (UUIDs).
INSERT INTO "user" (id, type, cognito_id, name, email, phone, organization_id)
VALUES
  ('00000000-0000-4000-b000-000000000001', 'admin', '11111111-1111-4111-8111-000000000001', 'Ana Admin', 'ana.admin@seed.test', '+40710000001', '00000000-0000-4000-a000-000000000001'),
  ('00000000-0000-4000-b000-000000000002', 'admin', '11111111-1111-4111-8111-000000000002', 'Bogdan Admin', 'bogdan.admin@seed.test', '+40710000002', '00000000-0000-4000-a000-000000000001'),
  ('00000000-0000-4000-b000-000000000003', 'admin', '11111111-1111-4111-8111-000000000003', 'Carmen Admin', 'carmen.admin@seed.test', '+40710000003', '00000000-0000-4000-a000-000000000002'),
  -- Both admin and volunteer: two independent logins, one per realm.
  ('00000000-0000-4000-b000-000000000004', 'admin', '11111111-1111-4111-8111-000000000004', 'Dana Both', 'dana.both@seed.test', '+40710000004', '00000000-0000-4000-a000-000000000002')
ON CONFLICT (id) DO NOTHING;

-- Volunteers (mobile realm after the migration). Email/password users have UUID Cognito
-- usernames; social users have provider-prefixed ones (R35).
INSERT INTO "user" (id, type, cognito_id, name, email, phone, first_name, last_name, active_organization_id)
VALUES
  ('00000000-0000-4000-c000-000000000001', 'regular', '22222222-2222-4222-8222-000000000001', 'Elena Voluntar', 'elena@seed.test', '+40720000001', 'Elena', 'Voluntar', '00000000-0000-4000-a000-000000000001'),
  ('00000000-0000-4000-c000-000000000002', 'regular', '22222222-2222-4222-8222-000000000002', 'Florin Voluntar', 'florin@seed.test', '+40720000002', 'Florin', 'Voluntar', NULL),
  ('00000000-0000-4000-c000-000000000003', 'regular', 'google_100000000000000000001', 'Gabriela Google', 'gabriela@seed.test', '+40720000003', 'Gabriela', 'Google', NULL),
  ('00000000-0000-4000-c000-000000000004', 'regular', 'signinwithapple_000001.seedapplesubject.0001', 'Horia Apple', 'horia@privaterelay.appleid.com', '+40720000004', 'Horia', 'Apple', NULL),
  ('00000000-0000-4000-c000-000000000005', 'regular', 'facebook_100000000000001', 'Ioana Facebook', 'ioana@seed.test', '+40720000005', 'Ioana', 'Facebook', NULL),
  ('00000000-0000-4000-c000-000000000006', 'regular', '22222222-2222-4222-8222-000000000006', 'Dana Both', 'dana.both@seed.test', '+40720000006', 'Dana', 'Both', '00000000-0000-4000-a000-000000000002')
ON CONFLICT (id) DO NOTHING;

-- A deleted volunteer: skipped by the import, and its email may be reused.
INSERT INTO "user" (id, type, cognito_id, name, email, phone, first_name, last_name, deleted_on)
VALUES
  ('00000000-0000-4000-c000-000000000007', 'regular', '22222222-2222-4222-8222-000000000007', 'Jean Sters', 'jean@seed.test', '+40720000007', 'Jean', 'Sters', now() - interval '30 days')
ON CONFLICT (id) DO NOTHING;

COMMIT;
