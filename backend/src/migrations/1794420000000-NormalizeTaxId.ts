import { Logger } from '@nestjs/common';
import { MigrationInterface, QueryRunner } from 'typeorm';

// M9: CUIs are stored normalized (no RO prefix, spaces, dots, dashes or leading zeros), so the
// unique index compares what the NGO is, not how it was typed. Values that would become duplicates
// are left as they are and listed in the log for the VIC team; nothing fails.
const NORMALIZED = `NULLIF(regexp_replace(regexp_replace(upper(regexp_replace(tax_id, '[\\s.\\-]', '', 'g')), '^RO', ''), '^0+(?=\\d)', ''), '')`;

export class NormalizeTaxId1794420000000 implements MigrationInterface {
  name = 'NormalizeTaxId1794420000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const duplicates: { normalized: string; organizations: string }[] =
      await queryRunner.query(
        `SELECT ${NORMALIZED} AS normalized,
                string_agg(name || ' [' || id || '] ' || tax_id, '; ' ORDER BY created_on) AS organizations
           FROM organization
          WHERE tax_id IS NOT NULL AND deleted_on IS NULL
          GROUP BY 1
         HAVING count(*) > 1`,
      );
    for (const duplicate of duplicates) {
      new Logger('NormalizeTaxId').warn(
        `CUI ${duplicate.normalized} is used by more than one organization, left unchanged: ${duplicate.organizations}`,
      );
    }

    await queryRunner.query(
      `UPDATE organization o SET tax_id = ${NORMALIZED.replace(/tax_id/g, 'o.tax_id')}
        WHERE o.tax_id IS NOT NULL
          AND o.tax_id IS DISTINCT FROM ${NORMALIZED.replace(/tax_id/g, 'o.tax_id')}
          AND NOT EXISTS (
            SELECT 1 FROM organization other
             WHERE other.id <> o.id AND other.tax_id IS NOT NULL
               AND ${NORMALIZED.replace(/tax_id/g, 'other.tax_id')} = ${NORMALIZED.replace(/tax_id/g, 'o.tax_id')}
               AND (other.deleted_on IS NULL OR o.deleted_on IS NOT NULL))`,
    );
  }

  public async down(): Promise<void> {
    // the original spellings are not kept; normalized CUIs stay valid
  }
}
