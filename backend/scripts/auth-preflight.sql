-- Pre-flight data checks for the own-auth migration (run on a copy of production).
-- Every query must return zero rows, or each row needs a recorded manual fix,
-- before the cutover migration (OwnAuthTables) and `npm run auth:migrate` run.

-- 1. Duplicate emails within a user type, ignoring case.
--    Breaks: UNIQUE INDEX user_type_email_unique ON "user"(type, lower(email)) WHERE deleted_on IS NULL
--    and the (realm, email) uniqueness of auth_identity.
SELECT type, lower(email) AS email, count(*) AS rows, array_agg(id ORDER BY created_on) AS ids
FROM "user"
WHERE deleted_on IS NULL
GROUP BY 1, 2
HAVING count(*) > 1;

-- 2. Admins without an organization. They cannot be given a web login that leads anywhere.
SELECT id, email, created_on
FROM "user"
WHERE type = 'admin' AND organization_id IS NULL AND deleted_on IS NULL;

-- 3. Emails with surrounding spaces or no '@'. The identity email is lower(trim(email)); fix these first.
SELECT id, type, email
FROM "user"
WHERE deleted_on IS NULL
  AND (email <> btrim(email) OR email NOT LIKE '%@%' OR email LIKE '% %');

-- 4. Organizations that collide once name, email and phone are compared case-insensitively
--    (registration enforces case-insensitive uniqueness).
SELECT 'name' AS field, lower(name) AS value, count(*) FROM organization WHERE deleted_on IS NULL GROUP BY 2 HAVING count(*) > 1
UNION ALL
SELECT 'email', lower(email), count(*) FROM organization WHERE deleted_on IS NULL GROUP BY 2 HAVING count(*) > 1
UNION ALL
SELECT 'phone', btrim(phone), count(*) FROM organization WHERE deleted_on IS NULL GROUP BY 2 HAVING count(*) > 1;

-- 5. Informational: how many identities the migration will create.
SELECT type, count(*) FROM "user" WHERE deleted_on IS NULL GROUP BY 1;

-- 6. Informational (decisions R35): today's volunteers by Cognito username prefix.
--    Rows for google, facebook or signinwithapple mean `auth:migrate` must create their
--    auth_identity_provider links from the Cognito username. The social buttons have been
--    hidden since 13 December 2023 (e0cd277d), so expect few or none.
SELECT CASE
         WHEN split_part(cognito_id, '_', 1) IN ('google', 'facebook', 'signinwithapple')
           THEN split_part(cognito_id, '_', 1)
         ELSE 'email_password'
       END AS kind,
       count(*)
FROM "user"
WHERE type = 'regular' AND deleted_on IS NULL
GROUP BY 1;

-- 7. Informational, not an auth problem: volunteers with no notification settings. The July 2023
--    migration that linked users to notifications_settings did not backfill, and approving their
--    access request or hours fails with a 500 (it reads requestedBy.notificationsSettings). Found in
--    the local web regression (issue 14). Expect zero; if not, backfill before the cutover:
--      INSERT INTO notifications_settings ... + UPDATE "user" SET notifications_settings_id = ...
SELECT count(*) AS volunteers_without_notification_settings
FROM "user"
WHERE type = 'regular' AND deleted_on IS NULL AND notifications_settings_id IS NULL;
