import React from 'react';
import { InfoParagraph } from './InfoParagraph';
import { Signature } from './Signature';
import { useTranslation } from 'react-i18next';
import { useOrganizationQuery } from '../services/organization/organization.service';
import { IMockVolunteer } from './ContractCard';
import LoadingContent from './LoadingContent';
import { OrganizationDataError } from './OrganizationDataError';

interface SignatureProps {
  volunteer?: IMockVolunteer;
}

export const Signatures = ({ volunteer }: SignatureProps) => {
  const { t } = useTranslation('doc_templates');
  const {
    data: organization,
    isLoading: isLoadingOrganization,
    isError: isErrorOrganization,
    isFetching,
    refetch,
  } = useOrganizationQuery();

  if (isLoadingOrganization) {
    return <LoadingContent />;
  }

  if (isErrorOrganization) {
    return <OrganizationDataError onRetry={refetch} isFetching={isFetching} />;
  }

  const isOrganizationNameMissing = !organization?.name;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row gap-8">
        <Signature
          signatureTitle={
            <div className="flex flex-row gap-1 flex-wrap">
              {t('template_preview.p2.organization')}{' '}
              {volunteer ? (
                <p>{organization?.name}</p>
              ) : (
                <InfoParagraph
                  text={!isOrganizationNameMissing ? organization?.name : t('organization.name')}
                />
              )}
            </div>
          }
          p={
            <div className="flex flex-row gap-1 flex-wrap">
              {' '}
              {t('represented_by')}
              {volunteer ? (
                <p>{organization?.legalReprezentativeFullName} </p>
              ) : (
                <InfoParagraph
                  text={organization?.legalReprezentativeFullName || `[${t('legal_rep_name')}]`}
                />
              )}
            </div>
          }
        />

        <Signature
          signatureTitle={<p>{t('volunteer.volunteer')}</p>}
          p={
            volunteer ? (
              volunteer.name
            ) : (
              <InfoParagraph text={`[${t('volunteer_name')}]`} className="self-baseline" />
            )
          }
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-8">
        {/* empty div to align items correctly */}
        <div className="flex-1 flex flex-col gap-4" />

        <Signature
          signatureTitle={<p>{t('legal_representative')}</p>}
          p={
            <div className="flex flex-col gap-1">
              {volunteer?.legalRepresentative?.name ? (
                <p>{volunteer.legalRepresentative.name}</p>
              ) : (
                <InfoParagraph text={`[${t('legal_rep_name')}]`} className="self-baseline" />
              )}

              <div className="flex flex-row gap-1 flex-wrap">
                {t('identification')}
                {volunteer?.legalRepresentative?.series ? (
                  <p>{volunteer.legalRepresentative.series}</p>
                ) : (
                  <InfoParagraph text={`[${t('series')}]`} />
                )}
                ,
                {volunteer?.legalRepresentative?.no ? (
                  <p>{volunteer?.legalRepresentative?.no}</p>
                ) : (
                  <InfoParagraph text={`[${t('number')}]`} />
                )}
              </div>
              <div className="flex flex-row gap-1 flex-wrap">
                {t('tel_no')}

                {volunteer?.legalRepresentative?.tel ? (
                  <p>{volunteer.legalRepresentative.tel}</p>
                ) : (
                  <InfoParagraph text={`[${t('telephone')}]`} />
                )}
              </div>
            </div>
          }
          className="mt-[-2rem] sm:mt-0"
        />
      </div>
    </div>
  );
};
