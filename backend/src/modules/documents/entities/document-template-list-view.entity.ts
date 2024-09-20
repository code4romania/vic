import { ViewColumn, ViewEntity } from 'typeorm';

@ViewEntity('DocumentTemplateListView', {
  expression: `
    SELECT
        document_template.id,
        document_template."name",
        document_template.created_on,
        document_template.organization_id,
        "user"."id" as created_by_id,
        "user"."name" as created_by_name,
        count(document_contract.id) as usage_count,
        max(document_contract.created_on) as last_usage
    FROM
        document_template
        LEFT JOIN document_contract ON document_template.id = document_contract.document_template_id
        LEFT JOIN "user" on document_template.created_by_admin_id = "user".id
    GROUP BY
        document_template.id,
        "user"."name",
        "user"."id"
  `,
})
export class DocumentTemplateListViewEntity {
  @ViewColumn({ name: 'id' })
  id: string;

  @ViewColumn({ name: 'name' })
  name: string;

  @ViewColumn({ name: 'created_on' })
  createdOn: Date;

  @ViewColumn({ name: 'created_by_id' })
  createdById: string;

  @ViewColumn({ name: 'created_by_name' })
  createdByName: string;

  @ViewColumn({ name: 'usage_count' })
  usageCount: number;

  @ViewColumn({ name: 'last_usage' })
  lastUsage: Date;

  @ViewColumn({ name: 'organization_id' })
  organizationId: string;
}
