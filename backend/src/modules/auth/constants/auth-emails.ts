import { LocalizedMail, MailCopy } from 'src/modules/mail/mail-copy';
import { IOrganizationModel } from 'src/modules/organization/models/organization.model';
import { Language } from 'src/modules/user/enums/user.enum';

// An auth email in Romanian and in English. AuthMailerService sends it in the recipient's language,
// or in both (Romanian first, English below) when VIC does not know it: renderMail in mail-copy.ts.
export type AuthEmail = LocalizedMail;

// The cutover date as each language writes it, e.g. { ro: 'sâmbătă, 12 decembrie', en: 'Saturday 12 December' }.
export interface CutoverDate {
  ro: string;
  en: string;
}

const RO_DAYS = [
  'duminică',
  'luni',
  'marți',
  'miercuri',
  'joi',
  'vineri',
  'sâmbătă',
];
const EN_DAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];
const RO_MONTHS = [
  'ianuarie',
  'februarie',
  'martie',
  'aprilie',
  'mai',
  'iunie',
  'iulie',
  'august',
  'septembrie',
  'octombrie',
  'noiembrie',
  'decembrie',
];
const EN_MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const capitalize = (text: string): string =>
  text.charAt(0).toUpperCase() + text.slice(1);

// `--date 2026-12-12` → the date in both languages. The names are spelled out here rather than taken
// from Intl, so the result does not depend on the ICU data of the Node build that runs the command.
export function cutoverDate(iso: string): CutoverDate {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso ?? '');
  const date = match
    ? new Date(Date.UTC(+match[1], +match[2] - 1, +match[3]))
    : null;
  if (
    !date ||
    date.getUTCDate() !== +match[3] ||
    date.getUTCMonth() !== +match[2] - 1
  ) {
    throw new Error(`--date must be a day as YYYY-MM-DD, got "${iso}"`);
  }
  const day = date.getUTCDate();
  return {
    ro: `${RO_DAYS[date.getUTCDay()]}, ${day} ${RO_MONTHS[date.getUTCMonth()]}`,
    en: `${EN_DAYS[date.getUTCDay()]} ${day} ${EN_MONTHS[date.getUTCMonth()]}`,
  };
}

export interface OrganizationRegisteredAdmin {
  name: string;
  email: string;
  phone: string;
}

const email = (
  ro: MailCopy,
  en: MailCopy,
  extra: { ctaLink?: string; code?: string } = {},
): AuthEmail => ({
  copy: { [Language.RO]: ro, [Language.EN]: en },
  ...extra,
});

export const AUTH_EMAILS = {
  transitionLinkAdmin: (url: string): AuthEmail =>
    email(
      {
        subject: 'VIC are un nou sistem de autentificare',
        title: 'VIC are un nou sistem de autentificare',
        subtitle:
          'Nu mai folosești parolă: intri în VIC cu un link trimis pe email. Primul link este mai jos și este valabil 30 de zile; după aceea, cere un link nou din pagina de autentificare. Te rugăm să verifici pagina Echipă a organizației și să dezactivezi persoanele care nu mai fac parte din ea.',
        ctaLabel: 'Intră în VIC',
      },
      {
        subject: 'VIC has a new login',
        title: 'VIC has a new login',
        subtitle:
          "No more passwords: you log in to VIC with a link sent by email. Your first link is below and is valid for 30 days; after that, ask for a new one on the login page. Please review your organization's Team page and disable anyone who has left.",
        ctaLabel: 'Log in to VIC',
      },
      { ctaLink: url },
    ),

  transitionLinkVolunteer: (): AuthEmail =>
    email(
      {
        subject: 'VIC are un nou sistem de autentificare',
        title: 'VIC are un nou sistem de autentificare',
        subtitle:
          'Nu mai folosești parolă: în aplicația VIC introduci adresa de email și primești un cod de autentificare. Poți intra în continuare și cu Google sau Apple. Aplicația nouă apare în magazine în zilele următoare și te anunțăm când e disponibilă; până atunci, aplicația pe care o ai funcționează ca până acum.',
      },
      {
        subject: 'VIC has a new login',
        title: 'VIC has a new login',
        subtitle:
          'No more passwords: in the VIC app you enter your email and get a login code. You can still sign in with Google or Apple. The new app reaches the stores in the following days and we will let you know when it is there; until then, the app you have works as before.',
      },
    ),

  // #471: an NGO added the person as an Active volunteer.
  volunteerInvitation: (
    organizationName: string,
    hasAccount: boolean,
  ): AuthEmail =>
    email(
      {
        subject: `${organizationName} te-a adăugat ca voluntar în VIC`,
        title: `Ești voluntar la ${organizationName}`,
        subtitle: hasAccount
          ? `${organizationName} te-a adăugat ca voluntar. Deschide aplicația VIC ca să vezi organizația, evenimentele, orele și documentele tale.`
          : `${organizationName} te-a adăugat ca voluntar în VIC. Instalează aplicația VIC din App Store sau Google Play și intră cu această adresă de email: primești un cod de autentificare, iar organizația, evenimentele, orele și documentele tale te așteaptă acolo.`,
      },
      {
        subject: `${organizationName} added you as a volunteer in VIC`,
        title: `You are a volunteer at ${organizationName}`,
        subtitle: hasAccount
          ? `${organizationName} added you as a volunteer. Open the VIC app to see the organization, your events, hours and documents.`
          : `${organizationName} added you as a volunteer in VIC. Install the VIC app from the App Store or Google Play and sign in with this email address: you will get a login code, and the organization, your events, hours and documents will be there.`,
      },
    ),

  loginLink: (url: string): AuthEmail =>
    email(
      {
        subject: 'Linkul tău de autentificare VIC',
        title: 'Intră în VIC',
        subtitle:
          'Folosește linkul de mai jos pentru a intra în contul tău. Linkul este valabil 15 minute și poate fi folosit o singură dată. Dacă nu ai cerut acest link, ignoră emailul.',
        ctaLabel: 'Intră în VIC',
      },
      {
        subject: 'Your VIC login link',
        title: 'Log in to VIC',
        subtitle:
          "Use the link below to log in to your account. The link is valid for 15 minutes and works once. If you didn't ask for it, ignore this email.",
        ctaLabel: 'Log in to VIC',
      },
      { ctaLink: url },
    ),

  loginCode: (code: string): AuthEmail =>
    email(
      {
        subject: `Codul tău VIC: ${code}`,
        title: 'Codul de autentificare',
        subtitle:
          'Introdu acest cod în aplicația VIC. Codul este valabil 15 minute. Dacă nu ai cerut codul, ignoră acest email.',
      },
      {
        subject: `Your VIC code: ${code}`,
        title: 'Your login code',
        subtitle:
          "Enter this code in the VIC app. The code is valid for 15 minutes. If you didn't ask for it, ignore this email.",
      },
      { code },
    ),

  inviteLink: (
    url: string,
    organizationName: string,
    invitedBy: string,
  ): AuthEmail =>
    email(
      {
        subject: `Invitație în ${organizationName} pe VIC`,
        title: `${invitedBy} te-a invitat în ${organizationName}`,
        subtitle:
          'Acceptă invitația pentru a administra organizația în VIC. Nu ai nevoie de parolă: data viitoare intri cu un link primit pe email. Invitația este valabilă 14 zile.',
        ctaLabel: 'Acceptă invitația',
      },
      {
        subject: `Invitation to ${organizationName} on VIC`,
        title: `${invitedBy} invited you to ${organizationName}`,
        subtitle:
          'Accept the invitation to manage the organization in VIC. No password needed: next time you log in with a link sent by email. The invitation is valid for 14 days.',
        ctaLabel: 'Accept the invitation',
      },
      { ctaLink: url },
    ),

  confirmOrganizationLink: (url: string, organizationName: string): AuthEmail =>
    email(
      {
        subject: `Activează ${organizationName} pe VIC`,
        title: `Confirmă adresa pentru ${organizationName}`,
        subtitle:
          'Confirmă adresa de email pentru a activa organizația. Linkul este valabil 24 de ore.',
        ctaLabel: 'Confirmă adresa',
      },
      {
        subject: `Activate ${organizationName} on VIC`,
        title: `Confirm your email for ${organizationName}`,
        subtitle:
          'Confirm your email address to activate the organization. The link is valid for 24 hours.',
        ctaLabel: 'Confirm the address',
      },
      { ctaLink: url },
    ),

  // To each super admin when an NGO confirmed its email. Only what tells them there is something to
  // validate: the contacts, the declarations and the suspend action stay on the validation page, behind
  // the login; an email is kept, forwarded and synced to phones (#710).
  organizationRegistered: (
    organization: Pick<IOrganizationModel, 'name' | 'taxId'>,
    validationPageUrl: string,
  ): AuthEmail =>
    email(
      {
        subject: `ONG nou de validat: ${organization.name}`,
        title: `ONG nou de validat: ${organization.name}`,
        subtitle: `${organization.name} (CUI ${organization.taxId}) și-a confirmat emailul. Verifică CUI-ul, apoi validează sau suspendă organizația pe pagina de validare.`,
        ctaLabel: 'Deschide pagina de validare',
      },
      {
        subject: `New NGO to validate: ${organization.name}`,
        title: `New NGO to validate: ${organization.name}`,
        subtitle: `${organization.name} (CUI ${organization.taxId}) confirmed its email. Check the CUI, then validate or suspend the organization on the validation page.`,
        ctaLabel: 'Open the validation page',
      },
      { ctaLink: validationPageUrl },
    ),

  organizationValidated: (
    organizationName: string,
    loginUrl: string,
  ): AuthEmail =>
    email(
      {
        subject: `${organizationName} a fost validată pe VIC`,
        title: `${organizationName} a fost validată`,
        subtitle:
          'Organizația este acum vizibilă voluntarilor în aplicație. Poți crea evenimente și înregistra ore de voluntariat.',
        ctaLabel: 'Intră în VIC',
      },
      {
        subject: `${organizationName} is validated on VIC`,
        title: `${organizationName} is validated`,
        subtitle:
          'Volunteers can now see the organization in the app. You can create events and log volunteering hours.',
        ctaLabel: 'Log in to VIC',
      },
      { ctaLink: loginUrl },
    ),

  // T-7, sent with `npm run announce -- --template announce --date <YYYY-MM-DD>` (decisions R3).
  announce: (date: CutoverDate): AuthEmail =>
    email(
      {
        subject: `${capitalize(date.ro)}, VIC are un nou sistem de autentificare`,
        title: `${capitalize(date.ro)}, VIC are un nou sistem de autentificare`,
        subtitle:
          'În acea zi, VIC va fi indisponibil câteva ore. După aceea, actualizează aplicația și intră cu adresa de email: primești un link sau un cod, fără parolă.',
      },
      {
        subject: `On ${date.en} VIC gets a new login`,
        title: `On ${date.en} VIC gets a new login`,
        subtitle:
          'VIC will be unavailable for a few hours that day. Afterwards, update the app and log in with your email address: you get a link or a code, no password.',
      },
    ),

  // T-1, sent with `npm run announce -- --template reminder --date <YYYY-MM-DD>` (decisions R3).
  reminder: (date: CutoverDate): AuthEmail =>
    email(
      {
        subject: `Mâine, ${date.ro}: noul sistem de autentificare VIC`,
        title: `Mâine, ${date.ro}, VIC are un nou sistem de autentificare`,
        subtitle:
          'VIC va fi indisponibil câteva ore. După aceea, actualizează aplicația și intră cu adresa de email: primești un link sau un cod, fără parolă.',
      },
      {
        subject: `Tomorrow, ${date.en}: VIC's new login`,
        title: `Tomorrow, ${date.en}, VIC gets a new login`,
        subtitle:
          'VIC will be unavailable for a few hours. Afterwards, update the app and log in with your email address: you get a link or a code, no password.',
      },
    ),

  // After go, sent with `npm run announce -- --template back` to every login, admins (web) and
  // volunteers (app) alike, so it explains both ways in.
  back: (): AuthEmail =>
    email(
      {
        subject: 'VIC funcționează din nou',
        title: 'VIC funcționează din nou',
        subtitle:
          'Nu mai folosești parolă. Pe web, la vic.ngohub.ro, introdu adresa de email și primești un link de autentificare. În aplicație, actualizeaz-o din magazin, introdu adresa de email și primești un cod; poți intra și cu Google sau Apple.',
      },
      {
        subject: 'VIC is back',
        title: 'VIC is back',
        subtitle:
          'No more passwords. On the web, at vic.ngohub.ro, enter your email address and you get a login link. In the app, update it from the store, enter your email address and you get a code; you can also sign in with Google or Apple.',
      },
    ),

  // The new app is in the stores (sent when the store review is done, a few days after go): volunteers only.
  app: (): AuthEmail =>
    email(
      {
        subject: 'Aplicația VIC nouă e în magazine',
        title: 'Aplicația VIC nouă e în magazine',
        subtitle:
          'Actualizează aplicația VIC din App Store sau Google Play. Intri cu adresa de email și primești un cod de autentificare, fără parolă; poți intra și cu Google sau Apple. Contul și datele tale rămân aceleași. Versiunea veche mai funcționează doar câteva săptămâni.',
      },
      {
        subject: 'The new VIC app is in the stores',
        title: 'The new VIC app is in the stores',
        subtitle:
          'Update the VIC app from the App Store or Google Play. You log in with your email address and get a code, no password; you can also sign in with Google or Apple. Your account and data stay the same. The old version keeps working only a few more weeks.',
      },
    ),

  // #508: the code asked before a sensitive action
  sensitiveActionCode: (
    code: string,
    action: { ro: string; en: string },
  ): AuthEmail =>
    email(
      {
        subject: `Cod de confirmare VIC: ${code}`,
        title: 'Confirmă acțiunea în VIC',
        subtitle: `Ai cerut să ${action.ro}. Introdu codul de mai jos în VIC pentru a confirma. Codul este valabil 10 minute. Dacă nu ai cerut tu acest cod, nu-l da nimănui și verifică cine are acces la contul tău.`,
      },
      {
        subject: `VIC confirmation code: ${code}`,
        title: 'Confirm the action in VIC',
        subtitle: `You asked to ${action.en}. Enter the code below in VIC to confirm. The code is valid for 10 minutes. If you didn't ask for it, don't share it and check who has access to your account.`,
      },
      { code },
    ),

  // #508: the code sent to the new address, to confirm it
  changeEmailCode: (code: string): AuthEmail =>
    email(
      {
        subject: `Confirmă noua adresă de email: ${code}`,
        title: 'Confirmă noua adresă de email',
        subtitle:
          'Cineva a cerut ca această adresă să devină emailul contului de VIC. Introdu codul în VIC pentru a confirma. Codul este valabil 10 minute. Dacă nu ai cerut tu, ignoră acest email.',
      },
      {
        subject: `Confirm your new email: ${code}`,
        title: 'Confirm your new email address',
        subtitle:
          "Someone asked to make this address the email of a VIC account. Enter the code in VIC to confirm. The code is valid for 10 minutes. If it wasn't you, ignore this email.",
      },
      { code },
    ),

  // #508: sent to the old address once the email changed
  emailChanged: (newEmail: string): AuthEmail =>
    email(
      {
        subject: 'Emailul contului VIC a fost schimbat',
        title: 'Emailul contului a fost schimbat',
        subtitle: `De acum intri în VIC cu adresa ${newEmail}. Dacă nu ai făcut tu schimbarea, scrie-ne imediat.`,
      },
      {
        subject: 'Your VIC email was changed',
        title: 'Your account email was changed',
        subtitle: `From now on you log in to VIC with ${newEmail}. If you didn't make this change, write to us right away.`,
      },
    ),

  // #508: the VIC team learns that an NGO deleted its account
  organizationDeleted: (
    organization: { name: string; taxId: string | null },
    deletedBy: { name: string; email: string },
  ): AuthEmail =>
    email(
      {
        subject: `Organizația ${organization.name} și-a șters contul VIC`,
        title: 'O organizație și-a șters contul',
        subtitle: `${organization.name}${organization.taxId ? ` (CUI ${organization.taxId})` : ''} și-a șters contul din VIC, împreună cu toate datele. Ștergerea a fost făcută de ${deletedBy.name} (${deletedBy.email}).`,
      },
      {
        subject: `${organization.name} deleted its VIC account`,
        title: 'An organization deleted its account',
        subtitle: `${organization.name}${organization.taxId ? ` (CUI ${organization.taxId})` : ''} deleted its VIC account and all its data. Deleted by ${deletedBy.name} (${deletedBy.email}).`,
      },
    ),
};
