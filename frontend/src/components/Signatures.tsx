import React, { useMemo } from 'react';
import { InfoParagraph } from './InfoParagraph';
import { Signature } from './Signature';
import { useTranslation } from 'react-i18next';
import { IOrganizationData } from '../common/interfaces/template.interface';
import { IVolunteer } from '../common/interfaces/volunteer.interface';
import { isOver16FromCNP } from '../common/utils/volunteer-data.util';

interface SignatureProps {
  volunteer?: IVolunteer;
  organization: IOrganizationData;
}

export const Signatures = ({ volunteer, organization }: SignatureProps) => {
  const { t } = useTranslation('doc_templates');

  const isOrganizationNameMissing = !organization?.officialName;
  const isVolunteerOver16 = useMemo(
    () =>
      volunteer && volunteer.user.userPersonalData
        ? isOver16FromCNP(volunteer.user.userPersonalData.cnp)
        : false,
    [volunteer],
  );

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row gap-8">
        <Signature
          signatureTitle={
            <div className="flex flex-row gap-1 flex-wrap">
              {t('template_preview.p2.organization')}{' '}
              {volunteer ? (
                <p>{organization?.officialName}</p>
              ) : (
                <InfoParagraph
                  text={
                    !isOrganizationNameMissing ? organization?.officialName : t('organization.name')
                  }
                />
              )}
            </div>
          }
          p={
            <div className="flex flex-row gap-1 flex-wrap">
              {' '}
              {t('represented_by')}
              {volunteer ? (
                <p>{organization?.legalRepresentativeName} </p>
              ) : (
                <InfoParagraph
                  text={organization?.legalRepresentativeName || `[${t('legal_rep_name')}]`}
                />
              )}
            </div>
          }
        />

        <Signature
          signatureTitle={<p>{t('volunteer.volunteer')}</p>}
          p={
            volunteer ? (
              volunteer.user.name
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
              {volunteer?.user.userPersonalData?.legalGuardian?.name ? (
                <p>{volunteer.user.userPersonalData?.legalGuardian?.name}</p>
              ) : (
                <InfoParagraph text={`[${t('legal_rep_name')}]`} className="self-baseline" />
              )}

              <div className="flex flex-row gap-1 flex-wrap">
                {t('identification')}
                {volunteer?.user.userPersonalData?.legalGuardian?.identityDocumentSeries ? (
                  <p>{volunteer.user.userPersonalData?.legalGuardian?.identityDocumentSeries}</p>
                ) : (
                  <InfoParagraph text={`[${t('series')}]`} />
                )}
                ,
                {volunteer?.user.userPersonalData?.legalGuardian?.identityDocumentNumber ? (
                  <p>{volunteer?.user.userPersonalData?.legalGuardian?.identityDocumentNumber}</p>
                ) : (
                  <InfoParagraph text={`[${t('number')}]`} />
                )}
              </div>
              <div className="flex flex-row gap-1 flex-wrap">
                {t('tel_no')}

                {volunteer?.user.userPersonalData?.legalGuardian?.phone ? (
                  <p>{volunteer?.user.userPersonalData?.legalGuardian?.phone}</p>
                ) : (
                  <InfoParagraph text={`[${t('telephone')}]`} />
                )}
              </div>
            </div>
          }
          // don't display legal guardian signature if the volunteer is over 16 years old
          className={`mt-[-2rem] sm:mt-0 ${isVolunteerOver16 ? 'hidden' : ''}`}
        />
      </div>
    </div>
  );
};
