import { Injectable } from '@nestjs/common';
import { isEmail } from 'class-validator';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { IAdminUserModel } from 'src/modules/user/models/admin-user.model';
import { VolunteerStatus } from 'src/modules/volunteer/enums/volunteer-status.enum';
import { VolunteerExceptionMessages } from 'src/modules/volunteer/exceptions/volunteer.exceptions';
import { DataSource } from 'typeorm';
import * as XLSX from 'xlsx';
import { AddVolunteerUseCase } from './add-volunteer.usecase';

export const IMPORT_MAX_ROWS = 1000;
export const IMPORT_MAX_BYTES = 1024 * 1024;
export const IMPORT_SOURCE = 'Import CSV';

// Why a row was not imported; the web app translates these.
export type ImportRowError =
  | 'first_name'
  | 'last_name'
  | 'email'
  | 'phone'
  | 'city_not_found'
  | 'city_ambiguous'
  | 'department_not_found';

export type ImportRowSkip = 'already_volunteer' | 'duplicate_in_file';

export interface ImportVolunteersResult {
  imported: number;
  skipped: { row: number; email: string; reason: ImportRowSkip }[];
  errors: { row: number; reasons: ImportRowError[] }[];
}

type Column =
  | 'firstName'
  | 'lastName'
  | 'email'
  | 'phone'
  | 'city'
  | 'county'
  | 'department';

// Header names accepted for each column, compared without diacritics, case or spaces.
const HEADERS: Record<Column, string[]> = {
  firstName: ['prenume', 'firstname'],
  lastName: ['nume', 'numedefamilie', 'lastname'],
  email: ['email', 'e-mail'],
  phone: ['telefon', 'phone'],
  city: ['localitate', 'oras', 'city'],
  county: ['judet', 'county'],
  department: ['departament', 'department'],
};

export const normalize = (value: unknown): string =>
  String(value ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();

const headerKey = (value: unknown): string =>
  normalize(value).replace(/ /g, '');

interface CityRow {
  id: number;
  name: string;
  county: string;
  abbreviation: string;
}

// #473: the NGO imports volunteers from a CSV (or an Excel sheet) with first name, last name, email,
// phone, city, county and department. Valid rows become Candidates (no email, no account unless the
// email already has one); invalid rows are reported with their row number; an email that is already
// a volunteer of the organization, or repeated in the file, is skipped.
@Injectable()
export class ImportVolunteersUseCase
  implements IUseCaseService<ImportVolunteersResult>
{
  constructor(
    private readonly addVolunteer: AddVolunteerUseCase,
    private readonly dataSource: DataSource,
    private readonly exceptionService: ExceptionsService,
  ) {}

  async execute(
    file: Express.Multer.File,
    admin: IAdminUserModel,
  ): Promise<ImportVolunteersResult> {
    const rows = this.readRows(file);

    const result: ImportVolunteersResult = {
      imported: 0,
      skipped: [],
      errors: [],
    };
    const departments = await this.departments(admin.organizationId);
    const cities = rows.some((row) => row.values.city)
      ? await this.cities()
      : [];
    const seen = new Set<string>();

    for (const { row, values } of rows) {
      const reasons: ImportRowError[] = [];
      const firstName = values.firstName.trim();
      const lastName = values.lastName.trim();
      const email = values.email.trim().toLowerCase();
      const phone = values.phone.trim();

      if (firstName.length < 2 || firstName.length > 50) {
        reasons.push('first_name');
      }
      if (lastName.length < 2 || lastName.length > 50) {
        reasons.push('last_name');
      }
      if (!isEmail(email) || email.length > 320) reasons.push('email');
      if (phone.length > 20) reasons.push('phone');

      let locationId: number;
      if (values.city.trim()) {
        const city = normalize(values.city);
        const county = normalize(values.county);
        const matches = cities.filter(
          (candidate) =>
            normalize(candidate.name) === city &&
            (!county ||
              normalize(candidate.county) === county ||
              normalize(candidate.abbreviation) === county),
        );
        if (matches.length === 1) locationId = matches[0].id;
        else reasons.push(matches.length ? 'city_ambiguous' : 'city_not_found');
      }

      let departmentId: string;
      if (values.department.trim()) {
        departmentId = departments.get(normalize(values.department));
        if (!departmentId) reasons.push('department_not_found');
      }

      if (reasons.length) {
        result.errors.push({ row, reasons });
        continue;
      }
      if (seen.has(email)) {
        result.skipped.push({ row, email, reason: 'duplicate_in_file' });
        continue;
      }
      seen.add(email);

      try {
        await this.addVolunteer.execute(
          {
            firstName,
            lastName,
            email,
            phone: phone || undefined,
            locationId,
            departmentId,
            source: IMPORT_SOURCE,
            status: VolunteerStatus.CANDIDATE,
          },
          admin,
        );
        result.imported += 1;
      } catch (error) {
        if (
          error?.response?.code_error ===
          VolunteerExceptionMessages.VOLUNTEER_009.code_error
        ) {
          result.skipped.push({ row, email, reason: 'already_volunteer' });
          continue;
        }
        throw error;
      }
    }

    return result;
  }

  // The rows under the header, numbered as in the file (the header is row 1). VOLUNTEER_010 when the
  // file cannot be read, misses the name or email columns, or is too long.
  private readRows(
    file: Express.Multer.File,
  ): { row: number; values: Record<Column, string> }[] {
    const invalid = (): never => {
      this.exceptionService.badRequestException(
        VolunteerExceptionMessages.VOLUNTEER_010,
      );
      return undefined as never;
    };
    if (!file?.buffer?.length || file.size > IMPORT_MAX_BYTES) invalid();

    let table: unknown[][];
    try {
      const isExcel = /\.xlsx?$/i.test(file.originalname ?? '');
      const workbook = isExcel
        ? XLSX.read(file.buffer, { type: 'buffer' })
        : XLSX.read(file.buffer.toString('utf8').replace(/^\uFEFF/, ''), {
            type: 'string',
            raw: true,
          });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      table = XLSX.utils.sheet_to_json(sheet, {
        header: 1,
        raw: false,
        defval: '',
        blankrows: true,
      });
    } catch {
      invalid();
    }
    if (!table?.length) invalid();

    const header = table[0].map(headerKey);
    const index = Object.fromEntries(
      (Object.keys(HEADERS) as Column[]).map((column) => [
        column,
        header.findIndex((name) => HEADERS[column].includes(name)),
      ]),
    ) as Record<Column, number>;
    if (index.firstName < 0 || index.lastName < 0 || index.email < 0) {
      invalid();
    }

    const rows = table
      .map((cells, i) => ({
        row: i + 1,
        values: Object.fromEntries(
          (Object.keys(HEADERS) as Column[]).map((column) => [
            column,
            index[column] < 0 ? '' : String(cells[index[column]] ?? ''),
          ]),
        ) as Record<Column, string>,
      }))
      .slice(1)
      .filter(({ values }) => Object.values(values).some((v) => v.trim()));
    if (rows.length > IMPORT_MAX_ROWS) invalid();
    return rows;
  }

  private async departments(
    organizationId: string,
  ): Promise<Map<string, string>> {
    const rows: { id: string; name: string }[] = await this.dataSource.query(
      `SELECT id, name FROM organization_structure
       WHERE organization_id = $1 AND type = 'department' AND deleted_on IS NULL`,
      [organizationId],
    );
    return new Map(rows.map((row) => [normalize(row.name), row.id]));
  }

  private async cities(): Promise<CityRow[]> {
    return this.dataSource.query(
      `SELECT city.id, city.name, county.name AS county, county.abbreviation
       FROM _city city JOIN _county county ON county.id = city.county_id`,
    );
  }
}
