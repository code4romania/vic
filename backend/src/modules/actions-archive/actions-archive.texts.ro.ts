// Romanian texts of the action history, copied from the web app's translations
// (frontend/src/assets/locales/ro/translation.json: actions_archive, and the status names it uses) so the
// backup can write the same sentences the web shows (#683). Regenerate when those texts change.

export const ACTION_TEXTS: Record<string, Record<string, string>> = {
  UPDATE_ORGANIZATION_PROFILE: {
    label: 'Actualizează Profil Organizație',
    description:
      'Descrierea organizației <inlineLink>{{organizationName}}</inlineLink> a fost modificată.',
  },
  CREATE_ORGANIZATION_STRUCTURE: {
    label: 'Creează Structura Organizației',
    branch:
      'A fost creată filiala cu numele <inlineLink>{{organizationStructureName}}</inlineLink>.',
    department:
      'A fost creat departamentul cu numele <inlineLink>{{organizationStructureName}}</inlineLink>.',
    role: 'A fost creat rolul cu numele <inlineLink>{{organizationStructureName}}</inlineLink>.',
  },
  UPDATE_ORGANIZATION_STRUCTURE: {
    label: 'Actualizează Structura Organizației',
    branch:
      'A fost modificat numele filialei din {{organizationStructureNameInitial}} în <inlineLink>{{organizationStructureNameFinal}}</inlineLink>.',
    department:
      'A fost modificat numele departamentului din {{organizationStructureNameInitial}} în <inlineLink>{{organizationStructureNameFinal}}</inlineLink>.',
    role: 'A fost modificat numele rolului din {{organizationStructureNameInitial}} în <inlineLink>{{organizationStructureNameFinal}}</inlineLink>.',
  },
  DELETE_ORGANIZATION_STRUCTURE: {
    label: 'Șterge Structura Organizației',
    branch: 'Filiala cu numele {{organizationStructureName}} a fost ștearsă.',
    department:
      'Departamentul cu numele {{organizationStructureName}} a fost șters.',
    role: 'Rolul cu numele {{organizationStructureName}} a fost șters.',
  },
  APPROVE_ACCESS_REQUEST: {
    label: 'Aprobă Cerere Acces',
    description:
      'Cererea de acces pentru voluntarul <inlineLink>{{userName}}</inlineLink> a fost aprobată.',
  },
  REJECT_ACCESS_REQUEST: {
    label: 'Respinge Cerere Acces',
    description:
      'Cererea de acces pentru utilizatorul {{userName}} a fost respinsă.',
  },
  DELETE_ACCESS_REQUEST: {
    label: 'Șterge Cerere Acces',
    description:
      'Cererea de acces pentru utilizatorul {{userName}} a fost ștearsă.',
  },
  CHANGE_VOLUNTEER_STATUS: {
    label: 'Modifică Status Voluntar',
    description:
      'Statusul pentru voluntarul <inlineLink>{{volunteerName}}</inlineLink> a fost schimbat din {{oldStatus}} în {{newStatus}}.',
  },
  UPDATE_VOLUNTEER_PROFILE: {
    label: 'Actualizează Profil Voluntar',
    description:
      'Profilul voluntarului <inlineLink>{{volunteerName}}</inlineLink> a fost modificat.',
  },
  DELETE_VOLUNTEER: {
    label: 'Șterge Voluntar',
    description:
      'Voluntarul {{volunteerName}} a fost șters, împreună cu {{activityLogs}} înregistrări de ore, {{contracts}} documente și {{registrations}} înscrieri la evenimente.',
  },
  REGISTER_ACTIVITY_LOG: {
    label: 'Înregistrează Ore de Voluntariat',
    description:
      'Voluntarul <inlineLink>{{volunteerName}}</inlineLink> a logat ore de voluntariat.',
  },
  CHANGE_ACTIVITY_LOG_STATUS: {
    label: 'Modifică Status Ore de Voluntariat',
    rejected:
      'Orele de voluntariat pentru <inlineLink>{{volunteerName}}</inlineLink> au fost respinse',
    approved:
      'Orele de voluntariat pentru <inlineLink>{{volunteerName}}</inlineLink> au fost aprobate',
  },
  CREATE_ACTIVITY_TYPE: {
    label: 'Creează Categorie Activitate',
    description:
      'Categoria de activitate <inlineLink>{{activityTypeName}}</inlineLink> a fost creată.',
  },
  UPDATE_ACTIVITY_TYPE: {
    label: 'Actualizează Categorie Activitate',
    description:
      'Categoria de activitate <inlineLink>{{activityTypeName}}</inlineLink> a fost modificată.',
  },
  CHANGE_ACTIVITY_TYPE_STATUS: {
    label: 'Modifică Status Categorie Activitate',
    description:
      'Statusul categoriei de activitate <inlineLink>{{activityTypeName}}</inlineLink> a fost schimbat din {{oldStatus}} în {{newStatus}}.',
  },
  CREATE_EVENT: {
    label: 'Creează Eveniment',
    description:
      'Evenimentul <inlineLink>{{eventName}}</inlineLink> a fost creat.',
  },
  UPDATE_EVENT: {
    label: 'Actualizează Eveniment',
    description:
      'Evenimentul <inlineLink>{{eventName}}</inlineLink> a fost modificat.',
  },
  DELETE_EVENT: {
    label: 'Șterge Eveniment',
    description: 'Evenimentul {{eventName}} a fost șters.',
  },
  CHANGE_EVENT_STATUS: {
    label: 'Modifică Status Eveniment',
    description:
      'Statusul evenimentului pentru <inlineLink>{{eventName}}</inlineLink> a fost schimbat din {{oldStatus}} în {{newStatus}}.',
  },
  CREATE_ANNOUNCEMENT: {
    label: 'Creează Anunț',
    description:
      'Anunțul <inlineLink>{{announcementTitle}}</inlineLink> a fost creat.',
  },
  DELETE_ANNOUNCEMENT: {
    label: 'Șterge Anunț',
    description: 'Anunțul {{announcementTitle}} a fost șters.',
  },
  PUBLISH_ANNOUNCEMENT: {
    label: 'Publică Anunț',
    description:
      'Anunțul <inlineLink>{{announcementTitle}}</inlineLink> a fost publicat.',
  },
  CREATE_CONTRACT: {
    label: 'Generează Contract',
    description:
      'Un nou contract a fost generat pentru voluntarul <inlineLink>{{volunteerName}}</inlineLink>',
  },
  APPROVE_CONTRACT: {
    label: 'Aprobă Contract',
    description:
      'Contractul cu numărul <inlineContractLink>{{contractNumber}}</inlineContractLink> pentru <inlineLink>{{volunteerName}}</inlineLink> a fost aprobat',
  },
  REJECT_CONTRACT: {
    label: 'Respinge Contract',
    description:
      'Contractul cu numărul <inlineContractLink>{{contractNumber}}</inlineContractLink> pentru <inlineLink>{{volunteerName}}</inlineLink> a fost respins',
  },
  DISABLE_ADMIN: {
    label: 'Dezactivează Administrator',
    description:
      'Administratorul <inlineLink>{{adminName}}</inlineLink> a fost dezactivat.',
  },
  UPDATE_ACTIVITY_LOG: {
    label: 'Actualizează Ore de Voluntariat',
    description:
      'Orele de voluntariat pentru <inlineLink>{{volunteerName}}</inlineLink> au fost modificate.',
  },
  CANCEL_ACTIVITY_LOG: {
    label: 'Șterge Ore de Voluntariat',
    description:
      'Voluntarul <inlineLink>{{volunteerName}}</inlineLink> a șters ore de voluntariat în așteptare.',
  },
  UPDATE_ANNOUNCEMENT: {
    label: 'Actualizează Anunț',
    description:
      'Anunțul <inlineLink>{{announcementTitle}}</inlineLink> a fost modificat.',
  },
  CHANGE_ANNOUNCEMENT_STATUS: {
    label: 'Modifică Status Anunț',
    description:
      'Statusul anunțului <inlineLink>{{announcementTitle}}</inlineLink> a fost schimbat din {{oldStatus}} în {{newStatus}}.',
  },
  CREATE_ACCESS_CODE: {
    label: 'Creează Cod de Acces',
    description:
      'Codul de acces <inlineLink>{{accessCode}}</inlineLink> a fost creat.',
  },
  UPDATE_ACCESS_CODE: {
    label: 'Actualizează Cod de Acces',
    description:
      'Codul de acces <inlineLink>{{accessCode}}</inlineLink> a fost modificat.',
  },
  DELETE_ACCESS_CODE: {
    label: 'Șterge Cod de Acces',
    description: 'Codul de acces {{accessCode}} a fost șters.',
  },
  ENABLE_ADMIN: {
    label: 'Activează Administrator',
    description:
      'Administratorul <inlineLink>{{adminName}}</inlineLink> a fost activat.',
  },
};

export const STATUS_TEXTS: Record<string, Record<string, string>> = {
  volunteer: {
    active: 'activ',
    blocked: 'blocat',
    inactive: 'inactiv',
    candidate: 'candidat',
    archived: 'arhivat',
  },
  activityType: {
    active: 'activă',
    archived: 'arhivată',
  },
  event: {
    draft: 'ciornă',
    published: 'publicat',
    archived: 'arhivat',
    finished: 'finalizat',
  },
  announcement: {
    active: 'activ',
    inactive: 'inactiv',
    archived: 'arhivat',
  },
};
