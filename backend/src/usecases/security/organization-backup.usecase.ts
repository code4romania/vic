import { Injectable } from '@nestjs/common';
import { format } from 'date-fns';
import { DataSource } from 'typeorm';
import * as XLSX from 'xlsx';

interface BackupSheet {
  name: string;
  sql: string;
}

// One sheet per kind of data; Romanian headers, as the NGO reads them.
const SHEETS: BackupSheet[] = [
  {
    name: 'Organizație',
    sql: `SELECT name AS "Nume", tax_id AS "CUI", email AS "Email", phone AS "Telefon",
                 address AS "Adresă", website AS "Website", activity_area AS "Domeniu",
                 description AS "Descriere", status AS "Status", created_on AS "Creată la",
                 validated_at AS "Validată la"
            FROM organization WHERE id = $1`,
  },
  {
    name: 'Voluntari',
    sql: `SELECT u.name AS "Nume", COALESCE(p.email, u.email) AS "Email", u.phone AS "Telefon",
                 v.status AS "Status", v.source AS "Sursă", v.notes AS "Note",
                 p.active_since AS "Activ din", d.name AS "Departament", r.name AS "Rol",
                 b.name AS "Filială", v.created_on AS "Adăugat la"
            FROM volunteer v JOIN "user" u ON u.id = v.user_id
            LEFT JOIN volunteer_profile p ON p.id = v.volunteer_profile_id
            LEFT JOIN organization_structure d ON d.id = p.department_id
            LEFT JOIN organization_structure r ON r.id = p.role_id
            LEFT JOIN organization_structure b ON b.id = p.branch_id
           WHERE v.organization_id = $1 AND v.deleted_on IS NULL
           ORDER BY u.name`,
  },
  {
    name: 'Ore',
    sql: `SELECT l.date AS "Data", u.name AS "Voluntar", l.hours AS "Ore", l.status AS "Status",
                 t.name AS "Tip activitate", e.name AS "Eveniment", l.mentions AS "Mențiuni",
                 l.rejection_reason AS "Motiv respingere", l.created_on AS "Înregistrat la"
            FROM activity_log l
            JOIN volunteer v ON v.id = l.volunteer_id JOIN "user" u ON u.id = v.user_id
            LEFT JOIN activity_type t ON t.id = l.activity_type_id
            LEFT JOIN event e ON e.id = l.event_id
           WHERE l.organization_id = $1 AND l.deleted_on IS NULL
           ORDER BY l.date DESC`,
  },
  {
    name: 'Evenimente',
    sql: `SELECT e.name AS "Nume", e.start_date AS "Început", e.end_date AS "Sfârșit",
                 e.location AS "Locație", e.status AS "Status", e.is_public AS "Public",
                 e.capacity AS "Capacitate",
                 (SELECT COUNT(*) FROM event_rsvp r WHERE r.event_id = e.id AND r.going
                    AND r.status = 'approved')::int AS "Înscriși", e.description AS "Descriere"
            FROM event e WHERE e.organization_id = $1 AND e.deleted_on IS NULL
           ORDER BY e.start_date DESC`,
  },
  {
    name: 'Înscrieri evenimente',
    sql: `SELECT e.name AS "Eveniment", u.name AS "Voluntar", u.email AS "Email",
                 r.going AS "Participă", r.status AS "Status", r.mention AS "Mențiune",
                 r.created_on AS "Înscris la"
            FROM event_rsvp r JOIN event e ON e.id = r.event_id JOIN "user" u ON u.id = r.user_id
           WHERE e.organization_id = $1 AND r.deleted_on IS NULL
           ORDER BY e.start_date DESC, u.name`,
  },
  {
    name: 'Anunțuri',
    sql: `SELECT name AS "Titlu", description AS "Text", type AS "Tip", status AS "Status",
                 volunteers_needed AS "Voluntari necesari", published_on AS "Publicat la",
                 display_start_date AS "Afișat din", display_end_date AS "Afișat până la"
            FROM announcement WHERE organization_id = $1 AND deleted_on IS NULL
           ORDER BY created_on DESC`,
  },
  {
    name: 'Răspunsuri anunțuri',
    sql: `SELECT a.name AS "Anunț", u.name AS "Voluntar", r.comment AS "Răspuns",
                 r.created_on AS "Data"
            FROM announcement_response r JOIN announcement a ON a.id = r.announcement_id
            JOIN "user" u ON u.id = r.user_id
           WHERE a.organization_id = $1 AND r.deleted_on IS NULL
           ORDER BY r.created_on DESC`,
  },
  {
    name: 'Documente',
    sql: `SELECT c.type AS "Tip", c.contract_number AS "Număr", u.name AS "Voluntar",
                 c.status AS "Status", c.start_date AS "Început", c.end_date AS "Sfârșit",
                 c.created_on AS "Încărcat la"
            FROM contract c JOIN volunteer v ON v.id = c.volunteer_id JOIN "user" u ON u.id = v.user_id
           WHERE c.organization_id = $1 AND c.deleted_on IS NULL
           ORDER BY c.created_on DESC`,
  },
  {
    name: 'Tipuri activitate',
    sql: `SELECT name AS "Nume", status AS "Status", created_on AS "Creat la"
            FROM activity_type WHERE organization_id = $1 AND deleted_on IS NULL ORDER BY name`,
  },
  {
    name: 'Structură',
    sql: `SELECT type AS "Tip", name AS "Nume", created_on AS "Creat la"
            FROM organization_structure WHERE organization_id = $1 AND deleted_on IS NULL
           ORDER BY type, name`,
  },
  {
    name: 'Administratori',
    sql: `SELECT u.name AS "Nume", u.email AS "Email", u.phone AS "Telefon", i.status AS "Status"
            FROM "user" u LEFT JOIN auth_identity i ON i.user_id = u.id AND i.realm = 'web'
           WHERE u.type = 'admin' AND u.organization_id = $1 AND u.deleted_on IS NULL
           ORDER BY u.name`,
  },
  {
    name: 'Istoric acțiuni',
    sql: `SELECT a.created_on AS "Data", a.event_name AS "Acțiune", u.name AS "Autor",
                 a.event_data::text AS "Detalii"
            FROM actions_archive a JOIN "user" u ON u.id = a.author_id
           WHERE u.organization_id = $1 AND u.type = 'admin'
           ORDER BY a.created_on DESC`,
  },
];

// VIC 2.0, #508: "Backup complet": everything VIC keeps for the organization, one Excel sheet per kind
// of data. Signed files (contracts, certificates) stay downloadable from the documents list.
@Injectable()
export class OrganizationBackupUsecase {
  constructor(private readonly dataSource: DataSource) {}

  public async execute(
    organizationId: string,
  ): Promise<{ fileName: string; data: Buffer }> {
    const workbook = XLSX.utils.book_new();
    for (const sheet of SHEETS) {
      const rows = await this.dataSource.query(sheet.sql, [organizationId]);
      const worksheet = rows.length
        ? XLSX.utils.json_to_sheet(rows)
        : XLSX.utils.aoa_to_sheet([['Fără date']]);
      XLSX.utils.book_append_sheet(workbook, worksheet, sheet.name);
    }
    return {
      fileName: `VIC-backup-${format(new Date(), 'yyyy-MM-dd')}.xlsx`,
      data: XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }),
    };
  }
}
