# 06 — Legarea organizațiilor vechi (M)

Status: resolved
Blocked by: 01 (și NGO Hub O12)

`npm run ngohub:link-orgs` cu dry-run.

Acceptare: se scriu doar potriviri exacte de CUI; potrivirile aproximative apar numai în raport; nicio scriere în dry-run.

## Comments

- Input: `npm run oidc:export-orgs -- --out ngohub-orgs.json` in NGO Hub (same environment; NGO Hub has no listing endpoint).
- `npm run ngohub:link-orgs -- --file ngohub-orgs.json [--report report.json]` is a dry run; `--apply` writes only exact normalized CUI matches that are unique on both sides and whose NGO Hub id is free. Name/email/phone only produce candidates; conflicts are listed. Already linked organizations are never touched.
- Question 15 (old organizations without CUI): the candidates in the report are for a person to fix by hand (set the CUI in VIC, run again). No confirmation at login.
