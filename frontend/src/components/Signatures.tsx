import React from 'react';
import { InfoParagraph } from './InfoParagraph';
import { Signature } from './Signature';
import { useTranslation } from 'react-i18next';
import { useOrganizationQuery } from '../services/organization/organization.service';

export const Signatures = () => {
  const { t } = useTranslation('doc_templates');
  const { data: organization } = useOrganizationQuery();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row gap-8">
        <Signature
          signatureTitle={
            <div className="flex flex-row gap-1 flex-wrap">
              {t('template_preview.p2.organization')}{' '}
              <InfoParagraph text={organization ? organization?.name : t('organization.name')} />
            </div>
          }
          p={
            <div className="flex flex-row gap-1 flex-wrap">
              {t('represented_by')} <InfoParagraph text=" " />
            </div>
          }
        />

        <Signature
          signatureTitle={<p>{t('volunteer.volunteer')}</p>}
          p={<InfoParagraph text={`[${t('volunteer_name')}]`} className="self-baseline" />}
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-8">
        {/* empty div to align items correctly */}
        <div className="flex-1 flex flex-col gap-4" />

        <Signature
          signatureTitle={<p>{t('legal_representative')}</p>}
          p={
            <div className="flex flex-col gap-1">
              <InfoParagraph text={`[${t('legal_rep_name')}]`} className="self-baseline" />
              <div className="flex flex-row gap-1 flex-wrap">
                {t('identification')} <InfoParagraph text={`[${t('series')}]`} />,{' '}
                <InfoParagraph text={`[${t('number')}]`} />
              </div>
              <div className="flex flex-row gap-1 flex-wrap">
                {t('tel_no')} <InfoParagraph text={`[${t('telephone')}]`} />
              </div>
            </div>
          }
          className="mt-[-2rem] sm:mt-0"
        />
      </div>
    </div>
  );
};
