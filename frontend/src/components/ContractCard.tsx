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

const dotsString = '.........................';

interface ContractCardProps {
  volunteer: IVolunteer,
  template: IDocumentTemplate,
  initialNumber?: string;
  initialDate?: Date | null;
  initialPeriod?: [Date | null, Date | null];
  isOpen?: boolean;
  onDelete: (id: string) => void;
}


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
  const [documentNumber, setDocumentNumber] = useState(initialNumber ? initialNumber : dotsString);
  const [documentDate, setDocumentDate] = useState(
    initialDate ? initialDate.toLocaleDateString() : dotsString,
  );
  const [documentPeriod, setDocumentPeriod] = useState(
    initialPeriod && initialPeriod[0] && initialPeriod[1]
      ? [initialPeriod[0].toLocaleDateString(), initialPeriod[1].toLocaleDateString()]
      : [dotsString, dotsString],
  );

  const isVolunteerDataIncomplete: boolean = false;

  const { control, handleSubmit, setValue } = useForm({
    defaultValues: {
      documentNumber: initialNumber || '',
      documentDate: initialDate || null,
      documentPeriod: initialPeriod || [null, null],
    },
  });

  // update values for the contract data, as well as for the contract preview, whenever the initial values coming from the parent change (the fast contract completion feature)
  useEffect(() => {
    // update contract number
    setDocumentNumber(initialNumber ? initialNumber : dotsString);
    setValue('documentNumber', initialNumber ? initialNumber : '');

    // update contract date
    setDocumentDate(initialDate ? initialDate.toLocaleDateString() : dotsString);
    setValue('documentDate', initialDate ? initialDate : null);

    // update contract period
    setDocumentPeriod([
      initialPeriod && initialPeriod[0] ? initialPeriod[0].toLocaleDateString() : dotsString,
      initialPeriod && initialPeriod[1] ? initialPeriod[1].toLocaleDateString() : dotsString,
    ]);
    setValue(
      'documentPeriod',
      initialPeriod && initialPeriod[0] && initialPeriod[1]
        ? [initialPeriod[0], initialPeriod[1]]
        : [null, null],
    );
  }, [initialNumber, initialDate, initialPeriod]);

  const onSubmit = (data: FieldValues) => {
    if (data.documentNumber) {
      setDocumentNumber(data.documentNumber);
    }

    if (data.documentDate) {
      setDocumentDate(data.documentDate.toLocaleDateString());
    }

    if (data.documentPeriod && data.documentPeriod[0] && data.documentPeriod[1]) {
      setDocumentPeriod([
        data.documentPeriod[0].toLocaleDateString(),
        data.documentPeriod[1].toLocaleDateString(),
      ]);
    }

    setEdit(false);
  };

  const onCancel = () => {
    setEdit(false);
    setValue('documentNumber', documentNumber);
    setValue('documentDate', documentDate ? new Date(documentDate) : null);
    setValue('documentPeriod', documentPeriod && documentPeriod[0] && documentPeriod[1] ? [new Date(documentPeriod[0]), new Date(documentPeriod[1])] : [null, null]);
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
              name="documentNumber"
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
              name="documentDate"
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
              name="documentPeriod"
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

            <div className='flex gap-4'>
              {edit && (
                <Button
                  label={t('cancel', { ns: 'general' })}
                  className="bg-gray-300 btn-secondary mt-4 text-gray-700 w-full"
                  onClick={onCancel}
                />

              )}
              <Button
                label={edit ? t('save', { ns: 'general' }) : t('edit', { ns: 'general', item: '' })}
                className="bg-yellow-500 btn-primary mt-4 text-white w-full"
                onClick={edit ? handleSubmit(onSubmit) : () => setEdit(true)}
              />
            </div>

          </div>

          {/* contract preview */}
          <div className="bg-white rounded flex-1 sm:flex-2 p-4 flex flex-col gap-4">
            <p className="font-robotoBold text-center">{t('template_preview.title')}</p>
            <p className="text-center">
              {t('template_preview.p1.no')} {documentNumber} {t('template_preview.p1.date')}{' '}
              {documentDate}
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
              {t('contract_duration.description')} {documentPeriod[0]} {t('template_preview.and')}{' '}
              {documentPeriod[1]}.
            </p>

            <div className="flex flex-col border-y-2 border-dashed py-6 gap-2">
              <p className="font-robotoBold">{t('contract_terms.title')}</p>

              {template.documentTerms && <ContentExpander fullContent={template.documentTerms} />}
            </div>
            <Signatures volunteer={volunteer} organization={template.organizationData} />
          </div>
        </div>
      )
      }
    </div >
  );
};
