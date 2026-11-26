# 02 — Client OIDC (M)

Status: ready-for-agent
Blocked by: — (în afara repo: NGO Hub O10–O12, făcute local)

`ngohub-oidc.service.ts`, configurare, starea fluxului în Redis cu cookie, apel la `/oidc/me`, `test/utils/fake-ngohub.ts`.

Acceptare: `iss`, `aud`, `nonce` greșite sunt respinse; `userinfo.sub` diferit e respins; callback fără cookie-ul de flux e respins; stare refolosită e respinsă; funcția e oprită fără configurare.
