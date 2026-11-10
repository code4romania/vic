import { EntityManager } from 'typeorm';

// M8 (GDPR): what VIC removes when a volunteer deletes their account, and for a person without an
// account (has_account = false) once the last NGO that added them deletes them (#484) or deletes
// itself (#508). Runs inside the caller's transaction; the caller deletes the returned S3 files
// after the commit (best effort, logged).
//
// Deleted:     the login (tokens, sessions, provider links go with it), push tokens, every
//              volunteer record with its profile, NGO notes and history, hours, contracts and
//              certificates (rows and PDFs), event registrations, access requests (with their
//              answers), announcement responses, the profile picture.
// Anonymized:  the "user" row itself is kept (soft deleted) with no personal data left: name and
//              email replaced, phone, birthday, sex, city, picture and links cleared. Nothing
//              else points at it any more.
// Kept:        the NGOs' own data (events, announcements, totals computed from what remains). The
//              change history (actions_archive) written by admins is not rewritten.
export interface IErasureResult {
  files: string[];
  volunteers: number;
}

const rows = <T>(result: unknown): T[] =>
  // a DELETE ... RETURNING comes back as [rows, count], a SELECT as rows
  (Array.isArray(result) && Array.isArray(result[0])
    ? result[0]
    : result) as T[];

export async function eraseRegularUser(
  manager: EntityManager,
  userId: string,
): Promise<IErasureResult> {
  const files: string[] = [];
  const q = (sql: string, params: unknown[] = [userId]): Promise<unknown> =>
    manager.query(sql, params);

  const [user] = rows<{ profile_picture: string | null }>(
    await q(
      `SELECT profile_picture FROM "user" WHERE id = $1 AND type = 'regular' FOR UPDATE`,
    ),
  );
  if (!user) return { files, volunteers: 0 };
  if (user.profile_picture) files.push(user.profile_picture);

  const volunteers = rows<{ id: string; volunteer_profile_id: string | null }>(
    await q(
      `SELECT id, volunteer_profile_id FROM volunteer WHERE user_id = $1`,
    ),
  );
  const volunteerIds = volunteers.map((v) => v.id);
  const profileIds = volunteers
    .map((v) => v.volunteer_profile_id)
    .filter(Boolean);

  await q(`DELETE FROM auth_identity WHERE user_id = $1`);
  await q(`DELETE FROM push_tokens WHERE user_id = $1`);
  await q(`DELETE FROM event_rsvp WHERE user_id = $1`);
  await q(`DELETE FROM access_request WHERE requested_by = $1`);
  await q(
    `DELETE FROM announcement_response WHERE user_id = $1 OR volunteer_id = ANY($2::uuid[])`,
    [userId, volunteerIds],
  );
  await q(`DELETE FROM volunteer_history WHERE user_id = $1`);
  if (volunteerIds.length) {
    await q(`DELETE FROM activity_log WHERE volunteer_id = ANY($1::uuid[])`, [
      volunteerIds,
    ]);
    const contracts = rows<{ path: string }>(
      await q(
        `DELETE FROM contract WHERE volunteer_id = ANY($1::uuid[]) RETURNING path`,
        [volunteerIds],
      ),
    );
    files.push(...contracts.map((c) => c.path).filter(Boolean));
    await q(`DELETE FROM volunteer WHERE id = ANY($1::uuid[])`, [volunteerIds]);
  }
  if (profileIds.length) {
    await q(`DELETE FROM volunteer_profile WHERE id = ANY($1::uuid[])`, [
      profileIds,
    ]);
  }

  await q(
    `UPDATE "user"
        SET name = 'Cont șters', first_name = 'Cont', last_name = 'șters',
            email = 'deleted-' || id || '@deleted.invalid',
            phone = NULL, birthday = NULL, sex = NULL, profile_picture = NULL,
            location_id = NULL, cognito_id = NULL, active_organization_id = NULL,
            has_account = false, deleted_on = now()
      WHERE id = $1`,
  );

  return { files, volunteers: volunteerIds.length };
}

// The people among `userIds` that no NGO and no login keep any more: no account, and no volunteer
// record left anywhere. Erased like a deleted account.
export async function eraseUsersWithoutAccount(
  manager: EntityManager,
  userIds: string[],
): Promise<{ files: string[]; erasedUserIds: string[] }> {
  if (!userIds.length) return { files: [], erasedUserIds: [] };
  const orphans = rows<{ id: string }>(
    await manager.query(
      `SELECT u.id FROM "user" u
        WHERE u.id = ANY($1::uuid[]) AND u.type = 'regular' AND u.has_account = false
          AND u.deleted_on IS NULL
          AND NOT EXISTS (SELECT 1 FROM volunteer v WHERE v.user_id = u.id)
          AND NOT EXISTS (SELECT 1 FROM auth_identity i WHERE i.user_id = u.id)`,
      [userIds],
    ),
  );
  const files: string[] = [];
  for (const { id } of orphans) {
    files.push(...(await eraseRegularUser(manager, id)).files);
  }
  return { files, erasedUserIds: orphans.map((o) => o.id) };
}
