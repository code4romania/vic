# 03 — Login cu NGO Hub (L)

Status: resolved
Blocked by: 01, 02

Cazul de utilizare, `start` și `callback`, e-mailul către ceilalți admini cu linkul „nu am fost noi”, înregistrarea în jurnal.

Acceptare: scenariile din spec 2.6 fără înregistrare; identitate deja legată de alt `sub` → AUTH_018; angajat → AUTH_017 și nimic creat; o identitate de mobil cu același e-mail nu blochează.

## Comments

- Codes: AUTH_016 (other organization), AUTH_017 (employee, ask for an invite), AUTH_018 (linked to another NGO Hub account), AUTH_019 (flow failed/expired), AUTH_020 (feature off).
- "Nu am fost noi": token `ngohub_revoke` (30 days) on the new admin's login, one link sent to every other non-disabled admin; `POST /auth/web/ngohub/not-us` disables that login like the Team page does. The link is not a login link and is never resent.
- History: `NGOHUB_ADMIN_JOINED` / `NGOHUB_ADMIN_REVOKED` in actions_archive (the frontend needs labels, issue 05).
- Question 16 (admin demoted to employee in NGO Hub): not handled; an existing VIC admin keeps logging in. To decide.
- A pending (never confirmed) organization: AUTH_003, both for login and for joining.
