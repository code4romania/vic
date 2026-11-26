# Login cu NGO Hub (OIDC) în VIC

Sursa: planul lui Andrew `plan-cu-decizii.md` (25 nov 2026). Aici sunt doar părțile care privesc VIC.

# Decizii Andrew, 25 nov 2026 (înlocuiesc ce contrazice planul de mai jos)

1. **Emitent:** `id.ngohub.ro` în producție, `id-staging.ngohub.ro` pe staging. Permanent. `auth.*` rămâne la Cognito până la tăiere.
2. **Ramură onghub:** `develop`, adus întâi la zi cu `main`. Merge-urile `develop` → `main` se îngheață până la runbookul de producție (de confirmat cu Code4).
3. **Baza NGO Hub de pe staging are date de test**, nu e copie de producție. Nu e nevoie de allowlist de e-mailuri pe staging.
4. **Admin NGO Hub al unui ONG care există deja în VIC (după CUI exact):** intră automat ca admin VIC. Ceilalți admini primesc e-mail cu link „nu am fost noi”, totul se scrie în jurnal.
5. **NGO Hub este DOAR SSO (furnizor de identitate).** NGO Hub nu mai decide cine are acces la VIC. Consecințe pentru plan:
   - din 3.4 dispar verificările per aplicație (`ong_application`, `user_ong_application`, „aplicația VIC activată”); rămân doar utilizator ACTIVE și organizație ACTIVE în NGO Hub;
   - promptul propriu `access` din O11 se simplifică mult (sau dispare), la fel partea de super-admin pentru clienți din O15 care ținea de aplicații;
   - accesul în VIC (admin / angajat / ONG nou) îl decide VIC, ca în 2.6.
6. **Sesiunea VIC după login prin NGO Hub:** normală, 7 zile, ca la Google/Apple. Fără sesiune scurtă și fără back-channel logout.
7. **Rețelele sociale:** nu adăugăm coloane în VIC; formularul precompletat ia doar câmpurile pe care VIC le are deja (contact, adresă, descriere, website, siglă).

Rămân deschise întrebările 7–17 din secțiunea 9; se rezolvă în faza indicată acolo. Întrebarea 16 (admin retrogradat) se rezolvă în VIC, nu în NGO Hub.

---

### 2.6 VIC ca prim client OIDC

**Backend:**
- Configurare în `backend/src/infrastructure/config/auth.config.ts`: `NGOHUB_ISSUER`, `NGOHUB_CLIENT_ID`, `NGOHUB_CLIENT_SECRET`, `NGOHUB_REDIRECT_URI`. Funcția e oprită dacă lipsesc.
- `backend/src/modules/auth/services/ngohub/ngohub-oidc.service.ts`: discovery cu cache; URL de autorizare; schimb de cod cu `client_secret_basic` și PKCE; verificarea ID tokenului cu `jwks-rsa` (`iss`, `aud`, `exp`, `nonce`), după modelul `services/social/apple.verifier.ts`; apel la `/oidc/me` cu verificarea `userinfo.sub === id_token.sub`.
- Starea fluxului: `/start` pune un cookie httpOnly aleatoriu (`SameSite=Lax`, path `/auth/web/ngohub`), iar Redis ține `{ state, nonce, verifier, cookieHash }` 10 minute. Callbackul cere potrivirea stării și a cookie-ului și șterge înregistrarea atomic (`GETDEL`). Fără această legare, un atacator poate autentifica victima în contul lui.
- Callbackul validează și parametrul `iss` din răspuns (RFC 9207).
- Endpointuri în `backend/src/api/auth/web-auth.controller.ts`: `GET /auth/web/ngohub/start`, `POST /auth/web/ngohub/callback`, `POST /auth/web/ngohub/register` (multipart). Toate au limită de ritm.

**`backend/src/usecases/auth/ngohub-login.usecase.ts`:**
1. Cere `email_verified === true` și claim-ul `organization`.
2. Caută legătura după `(ngohub, sub)`, apoi identitatea web după e-mail.
3. Legarea după e-mail e permisă numai dacă identitatea nu are deja o legătură `ngohub` și organizația din claim se potrivește cu organizația VIC a identității. Dacă există deja legătură către alt `sub`, se refuză cu AUTH_018.
4. Identitate găsită: DISABLED sau organizație suspendată → AUTH_004; altă organizație → AUTH_016; PENDING devine ACTIVE; se creează legătura; pornește sesiunea.
5. Fără identitate, organizația există în VIC (după `ngohub_organization_id`, apoi după CUI normalizat exact): adminul NGO Hub este adăugat ca admin VIC și ceilalți admini primesc e-mail; angajatul primește AUTH_017 („cere o invitație de la admin”).
6. Fără identitate, organizație necunoscută: adminul primește un tichet de înregistrare; angajatul e refuzat.

**Protecții la intrarea automată ca admin** (decizia lui Andrew rămâne; vezi întrebarea 4):
- e-mailul către ceilalți admini conține un link „nu am fost noi”, care revocă adminul nou;
- operația se scrie în jurnal;
- potrivirea se face doar pe CUI normalizat exact, niciodată pe nume, e-mail sau telefon.

**Înregistrarea organizației** (`backend/src/usecases/organization/register-ngohub-organization.usecase.ts`, derivat din `register-organization.usecase.ts`):
- Tichetul stă în Redis 30 de minute, e de unică folosință (`GETDEL`) și e legat de același cookie de flux. Ține `sub`, e-mailul și instantaneul organizației.
- CUI, numele organizației și e-mailul adminului se iau numai din tichet, niciodată din corpul cererii.
- Organizația intră ACTIVE, cu `validatedAt = now`, fără autodeclarație; rămâne doar bifa de termeni. `ngohub_organization_id` este setat. `assertUnique` rămâne.
- Sigla se descarcă pe server numai din URL-ul păstrat în tichet: doar `https`, doar gazda bucketului S3 al NGO Hub, fără redirecturi, cu timeout și limită de 5 MB. `isLogoImage` primește azi un fișier Multer, deci are nevoie de un adaptor pentru buffer.

**Frontend** (`frontend/src`):
- `components/NgoHubLoginButton.tsx` în `pages/Login.tsx`, afișat doar dacă `VITE_NGOHUB_ENABLED` e setat.
- `pages/NgoHubCallback.tsx` pe `/login/ngohub/callback`: scoate `code` și `state` din URL cu `history.replaceState` înainte de afișare; pagina are `Referrer-Policy: no-referrer`.
- `pages/RegisterNgoHubOrganization.tsx`: blocate CUI, numele organizației, e-mailul adminului; editabile restul, conform deciziei.
- Trei apeluri noi în `services/auth/auth.api.ts`, erori în `common/errors/entities/auth.errors.ts`, traduceri ro/en, rutele noi pe lista de excluderi de la refresh-pe-401.
- După logout din VIC, următorul „Autentificare cu NGO Hub” trimite `prompt=login`, ca pe un calculator partajat să nu intre automat persoana următoare.

**Organizații VIC vechi:** `organization.tax_id` a fost adăugat fără completare retroactivă, deci organizațiile vechi au probabil `tax_id IS NULL` și potrivirea după CUI le ratează **[DE VERIFICAT pe o copie de staging]**. Comanda `npm run ngohub:link-orgs` scrie doar potrivirile exacte de CUI normalizat, după revizuire umană; potrivirile aproximative (nume, e-mail, telefon) merg într-un raport.


### 3.2 Scope-uri și claims

| Scope | Claims |
|---|---|
| `openid` | `sub` |
| `email` | `email`, `email_verified` |
| `profile` | `name` |
| `organization` | `organization` (obiectul de mai jos) |

- `sub` este `user.id` ca șir zecimal. Formatul se îngheață; un id nu se refolosește niciodată după ștergerea utilizatorului.
- `email_verified` este `true` numai dacă `auth_identity.email_verified_at` e setat, adică după o autentificare reușită cu link sau cod.
- Cu setarea implicită `conformIdTokenClaims: true`, ID tokenul conține doar `sub`. Celelalte claims se citesc de la `/oidc/me`. Păstrăm implicitul.
- Claims se citesc din baza de date la fiecare apel, nu din cache.

**Obiectul `organization`:**

```json
{
  "id": 123, "cui": "12345678", "name": "…", "role": "admin",
  "email": "…", "phone": "…",
  "address": "…", "county": { "id": 1, "name": "…" }, "city": { "id": 2, "name": "…" },
  "short_description": "…", "website": "…",
  "social": { "facebook": "…", "instagram": "…", "twitter": "…", "linkedin": "…", "tiktok": "…" },
  "logo_url": "https://…(presemnat)", "logo_url_expires_at": "2026-…"
}
```

Sursa este `organization-general.entity.ts`, care are două seturi de adresă: `address`/`city_id`/`county_id` și `organization_address`/`organization_city_id`/`organization_county_id`. Care merge la VIC este întrebarea 13.


### 4.2 VIC (o migrare)

- `ALTER TYPE auth_identity_provider_provider_enum ADD VALUE 'ngohub'`, cu `down()` după modelul din `SensitiveActionTokens`.
- `organization.ngohub_organization_id integer NULL`, cu index unic parțial (`WHERE ngohub_organization_id IS NOT NULL AND deleted_on IS NULL`).
- Legătura se păstrează per emitent: fiecare mediu are un singur `NGOHUB_ISSUER`, iar un `sub` de staging nu poate ajunge într-o bază de producție.
- Coloane pentru rețele sociale, doar dacă se confirmă întrebarea 6.

