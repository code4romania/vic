# 04 — Înregistrarea organizației din NGO Hub (M)

Status: resolved
Blocked by: 03

Tichet, caz de utilizare, endpoint, copierea siglei cu listă de gazde permise.

Acceptare: organizație ACTIVE și validată; câmpurile blocate din corp sunt ignorate; tichet refolosit e refuzat; URL de siglă de pe altă gazdă e refuzat.

## Comments

- `POST /auth/web/ngohub/register` (multipart, under the flow cookie's path). Answers with a session, like the callback.
- The ticket is used up by the first attempt, even a failed one (plan: GETDEL). A 409 means going through NGO Hub again.
- Logo: an uploaded file wins; otherwise `useNgoHubLogo=true` copies `logo_url` from the ticket, only from `NGOHUB_LOGO_HOSTS` (new env, empty = never). Any problem = no logo, the registration goes on.
- Super admins are not emailed (the NGO is validated already). To confirm with Andrew.
