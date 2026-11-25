# D1 · Days 1 to 7: monitor logins, transition links and emails, run the support playbook

Status: ready-for-human
Type: task
Blocked by: 23
Tracker card: D1

> **Updated 2026-11-25:** VIC 2.0 has no passwords (#514). Admins log in on the web with a link sent by email, volunteers in the app with a 6-digit emailed code, or with Google / Apple. The checks and the support actions below replace the password ones in the Guide (AUTH_001, AUTH_002 and AUTH_007 are no longer returned; there is no lockout and no Forgot password).

Each morning for seven days, then a short write-up under Comments on day 7. SQL runs against production through `aws ecs run-task` or a read replica, never from a laptop with write access.

## Daily checks

| What | Where | Healthy looks like |
| --- | --- | --- |
| Bad or expired links and codes: AUTH_005 (link or code invalid, expired or used), AUTH_015 (wrong code), AUTH_006 (fifth wrong code) | backend logs | Some on day 1 (old emails, codes typed late), falling daily. Many AUTH_006 from one IP: someone guessing codes, tighten the throttle |
| Rate limits: AUTH_010 | backend logs | A few. Many for one account: a person retrying, or someone flooding that address |
| No admin for this email: AUTH_014 | backend logs | A few: volunteers on the web, or admins with a different address. Repeats from the same address go to support |
| Old app: 401s on `/mobile/*` without an `x-app-version` header (R22), and Update now installs | backend logs, `eas update:view` | Falling as people update. AUTH_011 only matters for future version bumps |
| Transition links used (admins) | `SELECT count(*) FILTER (WHERE used_at IS NOT NULL) AS used, count(*) AS sent FROM auth_token WHERE type = 'invite' AND sent_by IS NULL` | Rising. They expire after 30 days; after that admins ask for a link on the login page |
| People who logged in at least once | `SELECT realm, count(*) FILTER (WHERE last_login_at IS NOT NULL) AS logged_in, count(*) AS total FROM auth_identity WHERE deleted_on IS NULL GROUP BY realm` | Rising every day |
| Social sign-ins | `SELECT provider, count(*) FROM auth_identity_provider GROUP BY provider` | Rising; AUTH_013 (social token invalid) near zero. Compare with the social count from issue 00 |
| Language chosen | `SELECT language, count(*) FROM "user" GROUP BY language` | Mostly `ro`; `en` only for people who switched |
| NGOs awaiting validation | super admin page on the web | Reviewed within a day |
| Email failures | `/admin/queues` (mail and transition queues), SES bounces and complaints | Near zero. A hard bounce means a wrong address in the `user` table |
| Support requests | the contact mailbox (`MAIL_CONTACT`) | Mostly "I did not get the email": check spam, send a new link or code |

## Support actions, most frequent first

- **An admin cannot get in:** they ask for a new link on the web login page (valid 15 minutes). If no email arrives and they have never logged in, a colleague uses Send invite on the Team page (the button shows only for admins who never logged in). AUTH_014 means the address has no admin account: check for a typo or another address.
- **A volunteer cannot get in:** they make sure the app is 2.0.0, type their email and ask for a new code (valid 15 minutes, five tries). Or they use Google / Apple if that is how they joined.
- **No email at all:** check spam and the Promotions tab; check `/admin/queues` and SES for a bounce. Apple private relay addresses (`@privaterelay.appleid.com`) receive mail only while `ngohub.ro` is registered under Sign in with Apple > Email sources (issue 21).
- **Wrong email on the account:** verify the person, then update `user.email` and `auth_identity.email` together, lowercased. They log in with the new address.
- **An admin wrongly disabled:** a colleague enables them on the Team page, or `UPDATE auth_identity SET status = 'pending' WHERE email = '...'`, then they ask for a link.
- **An ex-employee still active (decision 3):** the NGO disables them on the Team page. If the NGO does not answer, a super admin suspends the NGO, or support disables that login.
- **An Apple "Hide my email" volunteer not matched to their old account:** they log in with the relay address by email code, which finds the migrated account. Note the case for the day 7 write-up.
- **A suspicious NGO registration:** `npm run org:suspend:prod -- <id> --reason "..."` (through `aws ecs run-task`, issue 22).
- **Day 7:** the counts above, day 1 vs day 7, and the issues met.

## Comments
