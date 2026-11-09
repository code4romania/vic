import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Pagination } from 'src/infrastructure/base/repository-with-pagination.class';
import { OrganizationStatus } from 'src/modules/organization/enums/organization-status.enum';

export interface IAdminListOptions {
  page: number;
  limit: number;
  search?: string;
}

export interface IAdminOrganizationListItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  taxId: string | null;
  status: OrganizationStatus;
  validatedAt: Date | null;
  createdOn: Date;
  volunteers: number;
}

export interface IAdminVolunteerListItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdOn: Date;
  organizations: string[];
}

const like = (search?: string): string | null =>
  search?.trim()
    ? `%${search.trim().replace(/[\\%_]/g, (c) => `\\${c}`)}%`
    : null;

const paginate = <T>(
  items: T[],
  total: number,
  { page, limit }: IAdminListOptions,
): Pagination<T> => ({
  items,
  meta: {
    itemCount: items.length,
    totalItems: total,
    itemsPerPage: limit,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
  },
});

// #511: the super admin's list of every organization, with its active volunteers.
@Injectable()
export class ListAdminOrganizationsUseCase {
  constructor(private readonly dataSource: DataSource) {}

  public async execute(
    options: IAdminListOptions & { status?: OrganizationStatus },
  ): Promise<Pagination<IAdminOrganizationListItem>> {
    const where = `o.deleted_on IS NULL
      AND ($1::text IS NULL OR o.name ILIKE $1 OR o.email ILIKE $1 OR o.tax_id ILIKE $1)
      AND ($2::text IS NULL OR o.status::text = $2)`;
    const params = [like(options.search), options.status ?? null];
    const [{ total }] = await this.dataSource.query(
      `SELECT COUNT(*) AS total FROM organization o WHERE ${where}`,
      params,
    );
    const rows = await this.dataSource.query(
      `SELECT o.id, o.name, o.email, o.phone, o.tax_id AS "taxId", o.status,
              o.validated_at AS "validatedAt", o.created_on AS "createdOn",
              (SELECT COUNT(*) FROM volunteer v
                WHERE v.organization_id = o.id AND v.status = 'active'
                  AND v.deleted_on IS NULL)::int AS volunteers
         FROM organization o
        WHERE ${where}
        ORDER BY o.created_on DESC, o.id
        LIMIT $3 OFFSET $4`,
      [...params, options.limit, (options.page - 1) * options.limit],
    );
    return paginate(rows, +total, options);
  }
}

// #511: every volunteer account (regular users), with the organizations they volunteer in.
@Injectable()
export class ListAdminVolunteersUseCase {
  constructor(private readonly dataSource: DataSource) {}

  public async execute(
    options: IAdminListOptions,
  ): Promise<Pagination<IAdminVolunteerListItem>> {
    const where = `u.type = 'regular' AND u.deleted_on IS NULL
      AND ($1::text IS NULL OR u.name ILIKE $1 OR u.email ILIKE $1 OR u.phone ILIKE $1)`;
    const params = [like(options.search)];
    const [{ total }] = await this.dataSource.query(
      `SELECT COUNT(*) AS total FROM "user" u WHERE ${where}`,
      params,
    );
    const rows = await this.dataSource.query(
      `SELECT u.id, u.name, u.email, u.phone, u.created_on AS "createdOn",
              COALESCE(
                (SELECT array_agg(o.name ORDER BY o.name) FROM volunteer v
                   JOIN organization o ON o.id = v.organization_id AND o.deleted_on IS NULL
                  WHERE v.user_id = u.id AND v.status = 'active' AND v.deleted_on IS NULL),
                '{}') AS organizations
         FROM "user" u
        WHERE ${where}
        ORDER BY u.created_on DESC, u.id
        LIMIT $2 OFFSET $3`,
      [...params, options.limit, (options.page - 1) * options.limit],
    );
    return paginate(rows, +total, options);
  }
}
