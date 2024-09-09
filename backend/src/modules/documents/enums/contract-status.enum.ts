export enum ContractStatus {
  PENDING_VOLUNTEER = 'PENDING_VOLUNTEER',
  PENDING_ADMIN = 'PENDING_ADMIN',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum DocumentContractStatus {
  CREATED = 'CREATED', // just created, not sent to volunteer
  SCHEDULED = 'SCHEDULED', // se va trimite la o data setata intr-un CRON si isi va schimba statusul in PENDING_VOLUNTEER
  PENDING_VOLUNTEER_SIGNATURE = 'PENDING_VOLUNTEER_SIGNATURE', // fost creat de Admin si trimis catre Voluntar
  PENDING_APPROVAL_NGO = 'PENDING_APPROVAL_NGO', // a fost semnat de voluntar si trimis la ONG pentru verificare
  PENDING_NGO_REPRESENTATIVE_SIGNATURE = 'PENDING_NGO_REPRESENTATIVE_SIGNATURE', // a fost aprobat de catre ONG si trimis catre reprezentantul legal al ONG-ului pentru semnare
  APPROVED = 'APPROVED', // a fost aprobat de ambele parti
  REJECTED_VOLUNTEER = 'REJECTED_VOLUNTEER', // a fost rejected de catre Voluntar
  REJECTED_NGO = 'REJECTED_NGO', // a fost rejected de catre NGO
  ACTION_EXPIRED = 'ACTION_EXPIRED', // a expirat dupa 30 zile de la generare daca nu a primit raspuns de la voluntar
}
