import React, { useEffect, useState } from 'react';
import FormInput from './FormInput';
import Button from './Button';
import { Controller, FieldValues, useForm } from 'react-hook-form';
import FormDatePicker from './FormDatePicker';
import DateRangePicker from './DateRangePicker';
import { ContractCardHeader } from './ContractCardHeader';
import { useTranslation } from 'react-i18next';
import { Signatures } from './Signatures';
import { ContentExpander } from './ContentExpander';
import { IVolunteer } from '../common/interfaces/volunteer.interface';
import { IDocumentTemplate } from '../common/interfaces/template.interface';
import { format } from 'date-fns';

interface ContractCardProps {
  volunteer: IVolunteer,
  template: IDocumentTemplate,
  initialNumber?: string;
  initialDate?: Date | null;
  initialPeriod?: [Date | null, Date | null];
  isOpen?: boolean;
  onDelete: (id: string) => void;
}

const dotsString = '.........................';

export const ContractCard = ({
  volunteer,
  template,
  initialNumber,
  initialDate,
  initialPeriod,
  onDelete,
  isOpen = false,
}: ContractCardProps) => {
  const { t } = useTranslation(['doc_templates', 'general']);
  // contract card states
  const [open, setOpen] = useState(isOpen);
  const [edit, setEdit] = useState(false);

  const isVolunteerDataIncomplete: boolean = false;

  const { control, handleSubmit, setValue } = useForm({
    defaultValues: {
      contractNumber: initialNumber || '',
      contractDate: initialDate || null,
      contractPeriod: initialPeriod || [null, null],
    },
  });

  // update values for the contract data, as well as for the contract preview, whenever the initial values coming from the parent change (the fast contract completion feature)
  useEffect(() => {
    // update contract number
    setContractNumber(initialNumber ? initialNumber : dotsString);
    setValue('contractNumber', initialNumber ? initialNumber : '');

    // update contract date
    setContractDate(initialDate ? initialDate.toLocaleDateString() : dotsString);
    setValue('contractDate', initialDate ? initialDate : null);

    // update contract period
    setContractPeriod([
      initialPeriod && initialPeriod[0] ? initialPeriod[0].toLocaleDateString() : dotsString,
      initialPeriod && initialPeriod[1] ? initialPeriod[1].toLocaleDateString() : dotsString,
    ]);
    setValue(
      'contractPeriod',
      initialPeriod && initialPeriod[0] && initialPeriod[1]
        ? [initialPeriod[0], initialPeriod[1]]
        : [null, null],
    );
  }, [initialNumber, initialDate, initialPeriod]);

  const [contractNumber, setContractNumber] = useState(initialNumber ? initialNumber : dotsString);
  const [contractDate, setContractDate] = useState(
    initialDate ? initialDate.toLocaleDateString() : dotsString,
  );
  const [contractPeriod, setContractPeriod] = useState(
    initialPeriod && initialPeriod[0] && initialPeriod[1]
      ? [initialPeriod[0].toLocaleDateString(), initialPeriod[1].toLocaleDateString()]
      : [dotsString, dotsString],
  );

  const onSubmit = (data: FieldValues) => {
    if (data.contractNumber) {
      setContractNumber(data.contractNumber);
    }

    if (data.contractDate) {
      setContractDate(data.contractDate.toLocaleDateString());
    }

    if (data.contractPeriod && data.contractPeriod[0] && data.contractPeriod[1]) {
      setContractPeriod([
        data.contractPeriod[0].toLocaleDateString(),
        data.contractPeriod[1].toLocaleDateString(),
      ]);
    }

    setEdit(false);
  };

  return (
    <div className="flex flex-col">
      <ContractCardHeader
        open={open}
        onDelete={onDelete}
        setOpen={setOpen}
        volunteer={volunteer}
        isError={isVolunteerDataIncomplete}
        isErrorText={t('volunteer.missing_data')}
      />

      {open && (
        <div className="bg-white shadow-xs p-4 mt-[-16px] pt-8 rounded flex flex-col gap-4 sm:flex-row">
          {/* datele contractului */}
          <div className="bg-gray-100 rounded flex-1 flex sm:self-baseline flex-col p-4 gap-4">
            <p className="font-robotoBold">{t('contract_data')}</p>
            <Controller
              name="contractNumber"
              control={control}
              render={({ field: { value = initialNumber, onChange } }) => (
                <FormInput
                  label={t('contract_no')}
                  disabled={!edit}
                  value={value}
                  onChange={onChange}
                  placeholder="1000"
                />
              )}
            />
            <Controller
              name="contractDate"
              control={control}
              render={({ field: { value, onChange } }) => (
                <FormDatePicker
                  label={t('contract_date')}
                  disabled={!edit}
                  value={value}
                  onChange={onChange}
                  placeholder="ZZ/LL/AAAAA"
                />
              )}
            />

            <Controller
              name="contractPeriod"
              control={control}
              render={({ field: { value, onChange } }) => (
                <DateRangePicker
                  label={t('contract_period')}
                  value={value as [Date | null, Date | null] | undefined}
                  disabled={!edit}
                  onChange={onChange}
                />
              )}
            />

            <Button
              label={edit ? t('save', { ns: 'general' }) : t('edit', { ns: 'general', item: '' })}
              className="bg-yellow btn-primary mt-4 text-white"
              onClick={edit ? handleSubmit(onSubmit) : () => setEdit(true)}
            />
          </div>

          {/* contract preview */}
          <div className="bg-white rounded flex-1 sm:flex-2 p-4 flex flex-col gap-4">
            <p className="font-robotoBold text-center">{t('template_preview.title')}</p>
            <p className="text-center">
              {t('template_preview.p1.no')} {contractNumber} {t('template_preview.p1.date')}{' '}
              {contractDate}
            </p>

            <p>
              {t('template_preview.p2.between')}{' '}
              <span className="font-robotoBold">
                {template?.organizationData?.officialName || `[${t('organization_name')}]`}
              </span>{' '}
              {t('template_preview.p2.address')}{' '}
              {template?.organizationData?.registeredOffice || `[${t('organization_address')}]`}{' '}
              {t('template_preview.p2.identified')}
              <span className="font-robotoBold">
                {' '}
                {template?.organizationData?.CUI || `[${t('organization_cui')}]`}
              </span>
              {', '}
              {t('template_preview.p2.represented_by')}{' '}
              <span className="font-robotoBold">
                {' '}
                {template?.organizationData?.legalRepresentativeName || `[${t('legal_rep_name')}]`}
              </span>
              {', '}
              {t('template_preview.p2.as')}{' '}
              {template?.organizationData?.legalRepresentativeRole || `[${t('legal_rep_role')}]`}{' '}
              {t('template_preview.p2.named')}{' '}
              <span className="italic">{t('template_preview.p2.organization')}</span>{' '}
            </p>

            <p>{t('template_preview.and')}</p>

            <p>
              <span className="font-robotoBold">{volunteer.user.name}</span>,{' '}
              {t('template_preview.p3.lives')} {volunteer.user.userPersonalData?.address}, {t('template_preview.p3.cnp')}{' '}
              <span className="font-robotoBold">{volunteer.user.userPersonalData?.cnp}</span>,{' '}
              {t('template_preview.p3.legitimate')} {volunteer.user.userPersonalData?.identityDocumentSeries} {t('template_preview.p3.no')}{' '}
              {volunteer.user.userPersonalData?.identityDocumentNumber}, {t('template_preview.p3.by')} {volunteer.user.userPersonalData?.identityDocumentIssuedBy},{' '}
              {t('template_preview.p3.at_date')} {volunteer.user.userPersonalData?.identityDocumentExpirationDate && format(volunteer.user.userPersonalData?.identityDocumentExpirationDate, 'dd/MM/yyyy')},
              {', '}
              {t('template_preview.p3.named')}{' '}
              <span className="italic"> {t('template_preview.p3.volunteer')}</span>{' '}
            </p>

            <p>{t('template_preview.p4')}</p>

            {/* P5: DURATA CONTRACTULUI */}
            <p className="font-robotoBold">{t('contract_duration.title')}</p>
            <p>
              {t('contract_duration.description')} {contractPeriod[0]} {t('template_preview.and')}{' '}
              {contractPeriod[1]}.
            </p>

            <div className="flex flex-col border-y-2 border-dashed py-6 gap-2">
              <p className="font-robotoBold">{t('contract_terms.title')}</p>

              {template.documentTerms && <ContentExpander fullContent={template.documentTerms} />}
            </div>
            <Signatures volunteer={volunteer} organization={template.organizationData} />
          </div>
        </div>
      )}
    </div>
  );
};
