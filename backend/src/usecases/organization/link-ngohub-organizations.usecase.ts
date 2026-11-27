import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { normalizeCui } from 'src/modules/organization/cui';
import { DataSource } from 'typeorm';

// One organization from NGO Hub's export (npm run oidc:export-orgs in onghub).
export interface NgoHubOrganizationRecord {
  id: number;
  cui: string | null;
  name: string | null;
  email: string | null;
  phone: string | null;
}

interface VicOrganization {
  id: string;
  name: string;
  taxId: string | null;
  email: string | null;
  phone: string | null;
  ngohubOrganizationId: number | null;
}

export type MatchField = 'name' | 'email' | 'phone';

export interface LinkNgoHubReport {
  vicOrganizations: number;
  ngohubOrganizations: number;
  alreadyLinked: number;
  // Exact normalized CUI, one on each side: written with --apply
  exact: { vicId: string; vicName: string; ngohubId: number; cui: string }[];
  // Same CUI on more than one NGO Hub (or VIC) organization, or the NGO Hub id is taken: never written
  conflicts: { vicId: string; vicName: string; cui: string; reason: string }[];
  // No exact CUI match, but name, email or phone look the same: for a person to check, never written
  candidates: {
    vicId: string;
    vicName: string;
    vicTaxId: string | null;
    ngohubId: number;
    ngohubName: string | null;
    ngohubCui: string | null;
    on: MatchField[];
  }[];
  unmatched: number;
  applied: number;
}

const plain = (value: string | null | undefined): string =>
  (value ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

const emailKey = (value: string | null | undefined): string =>
  (value ?? '').trim().toLowerCase();

// The last 9 digits: +40 712 345 678, 0712345678 and 0040712345678 are the same number.
const phoneKey = (value: string | null | undefined): string => {
  const digits = (value ?? '').replace(/\D/g, '');
  return digits.length >= 9 ? digits.slice(-9) : '';
};

const cuiKey = (value: string | null | undefined): string =>
  value ? normalizeCui(String(value)) : '';

// Login with NGO Hub, issue 06: links VIC organizations from before the NGO Hub login to their NGO Hub
// organization, so an NGO Hub admin finds them even where VIC has no CUI. Only an exact normalized CUI,
// unique on both sides, is ever written (--apply); name, email and phone only produce candidates for a
// person to check. Without apply nothing is written. Organizations already linked are left alone.
@Injectable()
export class LinkNgoHubOrganizationsUseCase
  implements IUseCaseService<LinkNgoHubReport>
{
  constructor(private readonly dataSource: DataSource) {}

  async execute(
    ngohub: NgoHubOrganizationRecord[],
    options: { apply: boolean },
  ): Promise<LinkNgoHubReport> {
    const vic: VicOrganization[] = await this.dataSource.query(
      `SELECT id, name, tax_id AS "taxId", email, phone,
              ngohub_organization_id AS "ngohubOrganizationId"
         FROM organization WHERE deleted_on IS NULL ORDER BY created_on`,
    );

    const byCui = groupBy(ngohub, (org) => cuiKey(org.cui));
    const vicByCui = groupBy(vic, (org) => cuiKey(org.taxId));
    const takenIds = new Set(
      vic.map((org) => org.ngohubOrganizationId).filter((id) => id != null),
    );

    const report: LinkNgoHubReport = {
      vicOrganizations: vic.length,
      ngohubOrganizations: ngohub.length,
      alreadyLinked: 0,
      exact: [],
      conflicts: [],
      candidates: [],
      unmatched: 0,
      applied: 0,
    };

    for (const org of vic) {
      if (org.ngohubOrganizationId != null) {
        report.alreadyLinked++;
        continue;
      }
      const cui = cuiKey(org.taxId);
      const sameCui = cui ? byCui.get(cui) ?? [] : [];
      if (sameCui.length) {
        const conflict =
          sameCui.length > 1
            ? `${sameCui.length} NGO Hub organizations have this CUI (${sameCui.map((o) => o.id).join(', ')})`
            : (vicByCui.get(cui)?.length ?? 0) > 1
              ? 'more than one VIC organization has this CUI'
              : takenIds.has(sameCui[0].id)
                ? `NGO Hub organization ${sameCui[0].id} is already linked to another VIC organization`
                : null;
        if (conflict) {
          report.conflicts.push({
            vicId: org.id,
            vicName: org.name,
            cui,
            reason: conflict,
          });
        } else {
          report.exact.push({
            vicId: org.id,
            vicName: org.name,
            ngohubId: sameCui[0].id,
            cui,
          });
        }
        continue;
      }

      const candidates = ngohub
        .map((hub) => ({ hub, on: sameFields(org, hub) }))
        .filter(({ on }) => on.length);
      if (!candidates.length) {
        report.unmatched++;
        continue;
      }
      for (const { hub, on } of candidates) {
        report.candidates.push({
          vicId: org.id,
          vicName: org.name,
          vicTaxId: org.taxId,
          ngohubId: hub.id,
          ngohubName: hub.name,
          ngohubCui: hub.cui,
          on,
        });
      }
    }

    if (options.apply && report.exact.length) {
      await this.dataSource.transaction(async (manager) => {
        for (const link of report.exact) {
          // Only where still unlinked: a login with NGO Hub may have linked it since the report.
          const [, updated] = await manager.query(
            `UPDATE organization SET ngohub_organization_id = $1
              WHERE id = $2 AND ngohub_organization_id IS NULL AND deleted_on IS NULL`,
            [link.ngohubId, link.vicId],
          );
          report.applied += updated;
        }
      });
    }

    return report;
  }
}

function sameFields(
  vic: VicOrganization,
  hub: NgoHubOrganizationRecord,
): MatchField[] {
  const on: MatchField[] = [];
  if (plain(vic.name) && plain(vic.name) === plain(hub.name)) on.push('name');
  if (emailKey(vic.email) && emailKey(vic.email) === emailKey(hub.email))
    on.push('email');
  if (phoneKey(vic.phone) && phoneKey(vic.phone) === phoneKey(hub.phone))
    on.push('phone');
  return on;
}

function groupBy<T>(items: T[], key: (item: T) => string): Map<string, T[]> {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const value = key(item);
    if (!value) continue;
    groups.set(value, [...(groups.get(value) ?? []), item]);
  }
  return groups;
}
