# 05 — Frontend (M)

Status: resolved
Blocked by: 03, 04

Buton, pagină de callback, formular, erori, traduceri, `prompt=login` după logout.

Acceptare: cele cinci scenarii parcurse local pe furnizorul fals; `code` nu rămâne în URL.

## Comments

Run locally on 2026-11-26 against the real NGO Hub provider (onghub `feat/ngohub-own-auth`, not the fake), Chrome:
1. Existing VIC admin, same CUI: logged in, linked, organization gets its NGO Hub id.
2. NGO Hub admin without a VIC login, known CUI: joins as admin; the other two admins get "nu am fost noi"; the link disables her; history shows both events.
3. NGO Hub employee: AUTH_017 on the callback page.
4. Unknown NGO: prefilled form, registered, logged in.
5. Logout then "Continuă cu NGO Hub": NGO Hub asks for a new code (prompt=login), also when switching accounts.
Found and fixed on the way: callback stuck under React StrictMode (VIC); NGO Hub ignored prompt=login (O11), lost the interaction on an account switch (O10 adapter) and blocked the redirect after its auto-submit page with CSP form-action (O13).
