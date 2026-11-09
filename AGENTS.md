# Working on VIC (for people and coding agents)

VIC is Code for Romania / Commit Global's volunteer management platform:

- `backend/`: NestJS API, TypeORM + Postgres (`backend/src/modules`, `usecases`, `api`, `migrations`).
- `frontend/`: React + Vite web app for NGO admins (`frontend/src/pages`, `components`, `services`).
- `mobile/`: Expo app for volunteers (`mobile/src/screens`, `services`, `contexts`).

GitHub issues in this repo are the source of truth for scope and decisions. Current scope is VIC 2.0: start from the tracking issue labeled `vic-2.0` ("[VIC 2.0] Product updates 2026"), which lists the work in order.

## Picking up an issue

1. Take an open issue labeled `agent-ready` whose "Blocked by" issues are closed. Skip `needs-info` issues: they wait on a client answer.
2. Read the whole issue: Context, Design, Acceptance criteria, Dependencies, Where to look. The issue text wins over the prototype and over older code comments.
3. Design reference: https://perch-pic-08148752.figma.site/ (navigate with the sidebar to the section the issue names). It is indicative: match the functionality and the existing UI components, not pixel-perfect.
4. Branch `vic2/<issue-number>-<short-slug>` from `main`. One issue per PR; keep unrelated refactors out.
5. Open a PR with `Closes #<issue-number>`, the acceptance criteria copied as a checked list, and screenshots or a short video for UI changes.
6. When something is ambiguous, comment on the issue with the question and add `needs-info`; do not guess on business rules.

## Product rules that apply everywhere (VIC 2.0)

- Login is magic link + Google/Apple social login. No passwords, no Facebook, no Cognito, no NGO Hub login.
- No ID card data anywhere. Volunteer profile: name, email, optional phone, county, city, mandatory date of birth.
- Contracts are uploaded signed PDFs with a validity period; VIC does not generate contracts. Certificates (adeverințe) are generated from a template.
- Volunteer statuses per organization: Active, Inactive (read-only), Blocked (permanent), Candidate (no account, no email).
- Rejections always carry a reason, and decisions can be changed later with a notification to the volunteer.
- UI language is Romanian; keep texts in the translation files (`frontend/src/assets/locales/{ro,en}`, `mobile/src/assets/locales/{ro,en}`), not hard-coded.

## Running and checking your change

- Backend: `cd backend && npm ci && npm run lint && npm test` (Node 20). Database changes need a TypeORM migration (`npm run migration:generate --name=<Name>`), never `synchronize`.
- Frontend: `cd frontend && npm ci && npm run lint && npm run build`.
- Mobile: `cd mobile && npm ci && npm run lint`; test on a dev build, not Expo Go, for anything native (auth, push).
- API changes must be reflected in both clients that use them (web and/or mobile) in the same PR or a linked one.
