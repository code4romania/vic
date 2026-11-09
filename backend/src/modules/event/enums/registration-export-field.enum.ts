// VIC 2.0 (#497): the columns the NGO can pick for the export of an event's registered volunteers
export enum RegistrationExportField {
  NAME = 'name',
  EMAIL = 'email',
  PHONE = 'phone',
  DEPARTMENT = 'department',
  BRANCH = 'branch',
  ROLE = 'role',
  HOURS = 'hours',
  REGISTERED_ON = 'registeredOn',
}

// column headers, in the order of the file
export const REGISTRATION_EXPORT_COLUMNS: Record<
  RegistrationExportField,
  string
> = {
  [RegistrationExportField.NAME]: 'Nume',
  [RegistrationExportField.EMAIL]: 'Email',
  [RegistrationExportField.PHONE]: 'Telefon',
  [RegistrationExportField.DEPARTMENT]: 'Departament',
  [RegistrationExportField.BRANCH]: 'Filiala',
  [RegistrationExportField.ROLE]: 'Rol',
  [RegistrationExportField.HOURS]: 'Ore aprobate in organizatie',
  [RegistrationExportField.REGISTERED_ON]: 'Data inscrierii',
};
