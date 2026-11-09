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
          'Alege o parolă nouă cu linkul de mai jos. Linkul este valabil 30 de zile. După autentificare, te rugăm să verifici pagina Echipă a organizației și să dezactivezi persoanele care nu mai fac parte din ea.',
      },
      {
        title: 'VIC has a new login',
        subtitle:
          "Choose a new password with the link below. The link is valid for 30 days. Once you are in, please review your organization's Team page and disable anyone who has left.",
      },
      { cta: { link: url, label: 'Setează parola' } },
    ),

  transitionLinkVolunteer: (url: string): AuthEmail =>
    email(
      'VIC are un nou sistem de autentificare / VIC has a new login',
      {
        title: 'VIC are un nou sistem de autentificare',
        subtitle:
          'Actualizează aplicația VIC din magazin. Setează o parolă cu acest link sau intră în aplicație cu Google, Facebook sau Apple, ca înainte. Linkul este valabil 30 de zile.',
      },
      {
        title: 'VIC has a new login',
        subtitle:
          'Update the VIC app from the store. Set a password with this link, or sign in with Google, Facebook or Apple in the app as before. The link is valid for 30 days.',
      },
      { cta: { link: url, label: 'Setează parola' } },
    ),

  resetLink: (url: string): AuthEmail =>
    email(
      'Resetare parolă VIC / Reset your VIC password',
      {
        title: 'Resetare parolă',
        subtitle:
          'Folosește linkul de mai jos pentru a alege o parolă nouă. Linkul este valabil o oră. Dacă nu ai cerut resetarea, ignoră acest email.',
      },
      {
        title: 'Reset your password',
        subtitle:
          "Use the link below to choose a new password. The link is valid for one hour. If you didn't ask for this, ignore this email.",
      },
      { cta: { link: url, label: 'Setează parola' } },
    ),

  resetCode: (code: string): AuthEmail =>
    email(
      `Codul tău VIC: ${code} / Your VIC code: ${code}`,
      {
        title: 'Codul pentru resetarea parolei',
        subtitle:
          'Introdu acest cod în aplicație împreună cu parola nouă. Codul este valabil 15 minute. Dacă nu ai cerut resetarea, ignoră acest email.',
      },
      {
        title: 'Your password reset code',
        subtitle:
          "Enter this code in the app together with your new password. The code is valid for 15 minutes. If you didn't ask for this, ignore this email.",
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
          'Acceptă invitația și alege o parolă pentru a administra organizația în VIC. Invitația este valabilă 14 zile.',
      },
      {
        title: `${invitedBy} invited you to ${organizationName}`,
        subtitle:
          'Accept the invitation and choose a password to manage the organization in VIC. The invitation is valid for 14 days.',
      },
      { cta: { link: url, label: 'Acceptă invitația' } },
    ),

  verifyEmailLink: (url: string): AuthEmail =>
    email(
      'Confirmă adresa de email VIC / Confirm your VIC email',
      {
        title: 'Confirmă adresa de email',
        subtitle:
          'Deschide linkul de mai jos pentru a-ți confirma contul, apoi întoarce-te în aplicație. Linkul este valabil 24 de ore.',
      },
      {
        title: 'Confirm your email address',
        subtitle:
          'Open the link below to confirm your account, then go back to the app. The link is valid for 24 hours.',
      },
      { cta: { link: url, label: 'Confirmă adresa' } },
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
      | 'activityArea'
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
      organization.activityArea,
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
        subtitle: `${details}. Statutul și datele sunt pe pagina de validare, unde poți valida sau suspenda organizația. Pentru suspendare din linia de comandă: ${suspend}`,
      },
      {
        title: `New NGO to validate: ${organization.name}`,
        subtitle: `The statute and the details are on the validation page, where you can validate or suspend the organization. To suspend from the command line: ${suspend}`,
      },
      // Not the statute itself: a presigned link would expire a day after the email.
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
          'În acea zi, VIC va fi indisponibil câteva ore. După aceea, actualizează aplicația și folosește linkul pe care ți-l trimitem pe email pentru a seta o parolă nouă.',
      },
      {
        title: `On ${date} VIC gets a new login`,
        subtitle:
          "VIC will be unavailable for a few hours that day. Afterwards, update the app and use the link we'll email you to set a new password.",
      },
    ),

  // T-1, sent with `npm run announce -- --template reminder --date <date>` (decisions R3).
  reminder: (date: string): AuthEmail =>
    email(
      `Mâine, ${date}: noul sistem de autentificare VIC / Tomorrow, ${date}: VIC's new login`,
      {
        title: `Mâine, ${date}, VIC are un nou sistem de autentificare`,
        subtitle:
          'VIC va fi indisponibil câteva ore. După aceea, actualizează aplicația și folosește linkul pe care ți-l trimitem pe email pentru a seta o parolă nouă.',
      },
      {
        title: `Tomorrow, ${date}, VIC gets a new login`,
        subtitle:
          "VIC will be unavailable for a few hours. Afterwards, update the app and use the link we'll email you to set a new password.",
      },
    ),

  // After go, sent with `npm run announce -- --template back`.
  back: (): AuthEmail =>
    email(
      'VIC funcționează din nou / VIC is back',
      {
        title: 'VIC funcționează din nou',
        subtitle:
          'Actualizează aplicația VIC din magazin, apoi folosește linkul din emailul „VIC are un nou sistem de autentificare” pentru a seta parola.',
      },
      {
        title: 'VIC is back',
        subtitle:
          'Update the VIC app from the store, then use the link in the "VIC has a new login" email in your inbox to set your password.',
      },
    ),

  passwordChanged: (): AuthEmail =>
    email(
      'Parola ta VIC a fost schimbată / Your VIC password was changed',
      {
        title: 'Parola ta a fost schimbată',
        subtitle:
          'Dacă nu tu ai făcut această schimbare, scrie-ne imediat la adresa de contact de mai jos.',
      },
      {
        title: 'Your password was changed',
        subtitle:
          "If you didn't make this change, write to us right away at the contact address below.",
      },
    ),
};
