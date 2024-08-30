import React, { useState } from 'react';
import { InfoParagraph } from '../InfoParagraph';
import { ContractTerms } from './ContractTerms';
import { useTranslation } from 'react-i18next';
import { Signatures } from '../Signatures';
import { useOrganizationQuery } from '../../services/organization/organization.service';

export const ContractTemplatePreview = () => {
  const { data: organization } = useOrganizationQuery();

  const { t } = useTranslation('doc_templates');
  const [infoParagraphHovered, setInfoParagraphHovered] = useState(false);

  const onInfoParagraphHover = () => {
    setInfoParagraphHovered(true);
  };
  const onInfoParagraphLeave = () => {
    setInfoParagraphHovered(false);
  };

  return (
    <div className="flex-2 p-4 flex flex-col gap-5">
      {/* header */}
      <p className="font-robotoBold text-center">{t('template_preview.title')}</p>

      {/* subheader */}
      <div className="flex flex-row gap-1 items-center justify-center">
        <p>{t('template_preview.p1.no')}</p>
        <InfoParagraph
          text={t('template_preview.p1.contract_no')}
          tooltip
          onMouseEnter={onInfoParagraphHover}
          onMouseLeave={onInfoParagraphLeave}
          highlighted={infoParagraphHovered}
        />
        <p>{t('template_preview.p1.date')} </p>
        <InfoParagraph
          text={t('template_preview.p1.contract_date')}
          tooltip
          onMouseEnter={onInfoParagraphHover}
          onMouseLeave={onInfoParagraphLeave}
          highlighted={infoParagraphHovered}
        />
      </div>

      {/* P1 */}
      <p>
        {t('template_preview.p2.between')}{' '}
        <InfoParagraph text={organization?.name || ''} className="font-robotoBold" />{' '}
        {t('template_preview.p2.address')} <InfoParagraph text={organization?.address || ''} />{' '}
        {t('template_preview.p2.identified')}{' '}
        <InfoParagraph text={organization?.cui || ''} className="font-robotoBold" />{' '}
        {t('template_preview.p2.represented_by')}{' '}
        <InfoParagraph
          text={organization?.legalRepresentative || ' ' + ','}
          className="font-robotoBold"
        />{' '}
        {t('template_preview.p2.as')}{' '}
        <InfoParagraph text={organization?.legalRepresentativeRole || ''} />{' '}
        {t('template_preview.p2.named')}{' '}
        <span className="italic">{t('template_preview.p2.organization')}</span>{' '}
      </p>

      {/* P2 */}

      <p>{t('template_preview.and')}</p>

      {/* P3 */}
      <p>
        <InfoParagraph text={t('volunteer.name') + ','} /> {t('template_preview.p3.lives')}{' '}
        <InfoParagraph text={t('volunteer.address') + ','} /> {t('template_preview.p3.cnp')}{' '}
        <InfoParagraph text={t('volunteer.cnp') + ','} /> {t('template_preview.p3.legitimate')}{' '}
        <InfoParagraph text={t('volunteer.series')} /> {t('template_preview.p3.no')}{' '}
        <InfoParagraph text={t('volunteer.no') + ','} /> {t('template_preview.p3.by')}{' '}
        <InfoParagraph text={t('volunteer.institution') + ','} /> {t('template_preview.p3.at_date')}{' '}
        <InfoParagraph text={t('volunteer.eliberation_date') + ','} />{' '}
        {t('template_preview.p3.named')}{' '}
        <span className="italic"> {t('template_preview.p3.volunteer')}</span>{' '}
      </p>

      {/* P4 */}
      <p>{t('template_preview.p4')}</p>

      {/* P5: DURATA CONTRACTULUI */}
      <p className="font-robotoBold">{t('contract_duration.title')}</p>
      <p>
        {t('contract_duration.description')}{' '}
        <InfoParagraph
          text={t('contract_duration.start')}
          tooltip
          onMouseEnter={onInfoParagraphHover}
          onMouseLeave={onInfoParagraphLeave}
          highlighted={infoParagraphHovered}
        />{' '}
        {t('template_preview.and')}{' '}
        <InfoParagraph
          text={t('contract_duration.end')}
          tooltip
          onMouseEnter={onInfoParagraphHover}
          onMouseLeave={onInfoParagraphLeave}
          highlighted={infoParagraphHovered}
        />
      </p>

      <ContractTerms />
      <Signatures />
    </div>
  );
};
