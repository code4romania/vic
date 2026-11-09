import { IOrganizationModel } from 'src/modules/organization/models/organization.model';

// Context for mail-template.hbs. The template runs with Handlebars strict mode, so every builder
// passes title, subtitle, cta and code (null when absent). contactEmail is added by MailService.
export interface AuthEmailContext {
  title: string;
  subtitle: string;
  cta: { link: string; label: string } | null;
  code: string | null;
  english: { title: string; subtitle: string };
}

export interface AuthEmail {
  subject: string;
  context: AuthEmailContext;
}

export interface OrganizationRegisteredAdmin {
  name: string;
  email: string;
  phone: string;
}

const email = (
  subject: string,
  ro: { title: string; subtitle: string },
  en: { title: string; subtitle: string },
  extra: { cta?: AuthEmailContext['cta']; code?: string } = {},
): AuthEmail => ({
  subject,
  context: {
    title: ro.title,
    subtitle: ro.subtitle,
    cta: extra.cta ?? null,
    code: extra.code ?? null,
    english: en,
  },
});

export const AUTH_EMAILS = {
  transitionLinkAdmin: (url: string): AuthEmail =>
    email(
      'VIC are un nou sistem de autentificare / VIC has a new login',
      {
        title: 'VIC are un nou sistem de autentificare',
        subtitle:
          'Nu mai folosești parolă: intri în VIC cu un link trimis pe email. Primul link este mai jos și este valabil 30 de zile; după aceea, cere un link nou din pagina de autentificare. Te rugăm să verifici pagina Echipă a organizației și să dezactivezi persoanele care nu mai fac parte din ea.',
      },
      {
        title: 'VIC has a new login',
        subtitle:
          "No more passwords: you log in to VIC with a link sent by email. Your first link is below and is valid for 30 days; after that, ask for a new one on the login page. Please review your organization's Team page and disable anyone who has left.",
      },
      { cta: { link: url, label: 'Intră în VIC' } },
    ),

  transitionLinkVolunteer: (): AuthEmail =>
    email(
      'VIC are un nou sistem de autentificare / VIC has a new login',
      {
        title: 'VIC are un nou sistem de autentificare',
        subtitle:
          'Actualizează aplicația VIC din magazin. Nu mai folosești parolă: introdu adresa de email în aplicație și primești un cod de autentificare. Poți intra în continuare și cu Google sau Apple.',
      },
      {
        title: 'VIC has a new login',
        subtitle:
          'Update the VIC app from the store. No more passwords: enter your email in the app and you will get a login code. You can still sign in with Google or Apple.',
      },
    ),

  // #471: an NGO added the person as an Active volunteer.
  volunteerInvitation: (
    organizationName: string,
    hasAccount: boolean,
  ): AuthEmail =>
    email(
      `${organizationName} te-a adăugat ca voluntar în VIC / ${organizationName} added you as a volunteer in VIC`,
      {
        title: `Ești voluntar la ${organizationName}`,
        subtitle: hasAccount
          ? `${organizationName} te-a adăugat ca voluntar. Deschide aplicația VIC ca să vezi organizația, evenimentele, orele și documentele tale.`
          : `${organizationName} te-a adăugat ca voluntar în VIC. Instalează aplicația VIC din App Store sau Google Play și intră cu această adresă de email: primești un cod de autentificare, iar organizația, evenimentele, orele și documentele tale te așteaptă acolo.`,
      },
      {
        title: `You are a volunteer at ${organizationName}`,
        subtitle: hasAccount
          ? `${organizationName} added you as a volunteer. Open the VIC app to see the organization, your events, hours and documents.`
          : `${organizationName} added you as a volunteer in VIC. Install the VIC app from the App Store or Google Play and sign in with this email address: you will get a login code, and the organization, your events, hours and documents will be there.`,
      },
    ),

  loginLink: (url: string): AuthEmail =>
    email(
      'Linkul tău de autentificare VIC / Your VIC login link',
      {
        title: 'Intră în VIC',
        subtitle:
          'Folosește linkul de mai jos pentru a intra în contul tău. Linkul este valabil 15 minute și poate fi folosit o singură dată. Dacă nu ai cerut acest link, ignoră emailul.',
      },
      {
        title: 'Log in to VIC',
        subtitle:
          "Use the link below to log in to your account. The link is valid for 15 minutes and works once. If you didn't ask for it, ignore this email.",
      },
      { cta: { link: url, label: 'Intră în VIC' } },
    ),

  loginCode: (code: string): AuthEmail =>
    email(
      `Codul tău VIC: ${code} / Your VIC code: ${code}`,
      {
        title: 'Codul de autentificare',
        subtitle:
          'Introdu acest cod în aplicația VIC. Codul este valabil 15 minute. Dacă nu ai cerut codul, ignoră acest email.',
      },
      {
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
      `Invitație în ${organizationName} pe VIC / Invitation to ${organizationName} on VIC`,
      {
        title: `${invitedBy} te-a invitat în ${organizationName}`,
        subtitle:
          'Acceptă invitația pentru a administra organizația în VIC. Nu ai nevoie de parolă: data viitoare intri cu un link primit pe email. Invitația este valabilă 14 zile.',
      },
      {
        title: `${invitedBy} invited you to ${organizationName}`,
        subtitle:
          'Accept the invitation to manage the organization in VIC. No password needed: next time you log in with a link sent by email. The invitation is valid for 14 days.',
      },
      { cta: { link: url, label: 'Acceptă invitația' } },
    ),

  confirmOrganizationLink: (url: string, organizationName: string): AuthEmail =>
    email(
      `Activează ${organizationName} pe VIC / Activate ${organizationName} on VIC`,
      {
        title: `Confirmă adresa pentru ${organizationName}`,
        subtitle:
          'Confirmă adresa de email pentru a activa organizația. Linkul este valabil 24 de ore.',
      },
      {
        title: `Confirm your email for ${organizationName}`,
        subtitle:
          'Confirm your email address to activate the organization. The link is valid for 24 hours.',
      },
      { cta: { link: url, label: 'Confirmă adresa' } },
    ),

  organizationRegistered: (
    organization: Pick<
      IOrganizationModel,
      | 'id'
      | 'name'
      | 'email'
      | 'phone'
      | 'address'
      | 'description'
      | 'website'
      | 'taxId'
    >,
    admin: OrganizationRegisteredAdmin,
    validationPageUrl: string,
  ): AuthEmail => {
    const details = [
      `${organization.name} (CUI ${organization.taxId})`,
      `${organization.email}, ${organization.phone}`,
      organization.address,
      organization.website,
      organization.description,
      `Admin: ${admin.name}, ${admin.email}, ${admin.phone}`,
    ]
      .filter(Boolean)
      .join(' · ');
    const suspend = `npm run org:suspend -- ${organization.id} --reason "..."`;

    return email(
      `ONG nou de validat: ${organization.name} / New NGO to validate`,
      {
        title: `ONG nou de validat: ${organization.name}`,
        subtitle: `${details}. Verifică CUI-ul, apoi validează sau suspendă organizația pe pagina de validare. Pentru suspendare din linia de comandă: ${suspend}`,
      },
      {
        title: `New NGO to validate: ${organization.name}`,
        subtitle: `Check the CUI, then validate or suspend the organization on the validation page. To suspend from the command line: ${suspend}`,
      },
      {
        cta: { link: validationPageUrl, label: 'Deschide pagina de validare' },
      },
    );
  },

  organizationValidated: (
    organizationName: string,
    loginUrl: string,
  ): AuthEmail =>
    email(
      `${organizationName} a fost validată pe VIC / ${organizationName} is validated on VIC`,
      {
        title: `${organizationName} a fost validată`,
        subtitle:
          'Organizația este acum vizibilă voluntarilor în aplicație. Poți crea evenimente și înregistra ore de voluntariat.',
      },
      {
        title: `${organizationName} is validated`,
        subtitle:
          'Volunteers can now see the organization in the app. You can create events and log volunteering hours.',
      },
      { cta: { link: loginUrl, label: 'Intră în VIC' } },
    ),

  // T-7, sent with `npm run announce -- --template announce --date <date>` (decisions R3).
  announce: (date: string): AuthEmail =>
    email(
      `Pe ${date} VIC are un nou sistem de autentificare / On ${date} VIC gets a new login`,
      {
        title: `Pe ${date} VIC are un nou sistem de autentificare`,
        subtitle:
          'În acea zi, VIC va fi indisponibil câteva ore. După aceea, actualizează aplicația și intră cu adresa de email: primești un link sau un cod, fără parolă.',
      },
      {
        title: `On ${date} VIC gets a new login`,
        subtitle:
          'VIC will be unavailable for a few hours that day. Afterwards, update the app and log in with your email address: you get a link or a code, no password.',
      },
    ),

  // T-1, sent with `npm run announce -- --template reminder --date <date>` (decisions R3).
  reminder: (date: string): AuthEmail =>
    email(
      `Mâine, ${date}: noul sistem de autentificare VIC / Tomorrow, ${date}: VIC's new login`,
      {
        title: `Mâine, ${date}, VIC are un nou sistem de autentificare`,
        subtitle:
          'VIC va fi indisponibil câteva ore. După aceea, actualizează aplicația și intră cu adresa de email: primești un link sau un cod, fără parolă.',
      },
      {
        title: `Tomorrow, ${date}, VIC gets a new login`,
        subtitle:
          'VIC will be unavailable for a few hours. Afterwards, update the app and log in with your email address: you get a link or a code, no password.',
      },
    ),

  // After go, sent with `npm run announce -- --template back`.
  back: (): AuthEmail =>
    email(
      'VIC funcționează din nou / VIC is back',
      {
        title: 'VIC funcționează din nou',
        subtitle:
          'Actualizează aplicația VIC din magazin, apoi intră cu adresa de email: primești un cod, fără parolă.',
      },
      {
        title: 'VIC is back',
        subtitle:
          'Update the VIC app from the store, then log in with your email address: you get a code, no password.',
      },
    ),
};
