import React, { useState } from 'react';
import FormInput from './FormInput';
import Button from './Button';
import { Controller, FieldValues, useForm } from 'react-hook-form';
import FormDatePicker from './FormDatePicker';
import DateRangePicker from './DateRangePicker';
import { ContractCardHeader } from './ContractCardHeader';
import { useTranslation } from 'react-i18next';
import { useOrganizationQuery } from '../services/organization/organization.service';
import { Signatures } from './Signatures';
import { ContentExpander } from './ContentExpander';

export interface IMockContract {
  id: string;
  name: string;
}

export interface IMockVolunteer {
  name: string;
  address: string;
  cnp: string;
  series: string;
  number: string;
  institution: string;
  issuanceDate: string;
  image: string;
  legalRepresentative?: {
    name: string;
    series: string;
    no: number;
    tel: string;
  };
}

interface ContractCardProps {
  data: { contract: IMockContract; volunteer: IMockVolunteer };
}

const dotsString = '.........................';
const contractTerms =
  '<h1>h1</h1><h2>h2</h2><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quis lobortis nisl cursus bibendum sit nulla accumsan sodales ornare. At urna viverra non suspendisse neque, lorem. Pretium condimentum pellentesque gravida id etiam sit sed arcu euismod. Rhoncus proin orci duis scelerisque molestie cursus tincidunt aliquam.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quis lobortis nisl cursus bibendum sit nulla accumsan sodales ornare. At urna viverra non suspendisse neque, lorem. Pretium condimentum pellentesque gravida id etiam sit sed arcu euismod. Rhoncus proin orci duis scelerisque molestie cursus tincidunt aliquam.</p>';

export const ContractCard = ({ data }: ContractCardProps) => {
  const { t } = useTranslation(['doc_templates', 'general']);
  //?   todo: get the contract data from a query and not from props
  const { contract, volunteer } = data;
  //   todo: delete this
  console.log(contract);

  // contract card states
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState(false);

  const [contractNumber, setContractNumber] = useState(dotsString);
  const [contractDate, setContractDate] = useState(dotsString);
  const [contractPeriod, setContractPeriod] = useState([dotsString, dotsString]);

  const { data: organization } = useOrganizationQuery();
  const { control, handleSubmit, setValue } = useForm();

  const onSubmit = (data: FieldValues) => {
    if (data.contractNumber) {
      setContractNumber(data.contractNumber);
    }

    if (data.contractDate) {
      setContractDate(data.contractDate.toLocaleDateString());
    }

    if (data.contractPeriod) {
      setContractPeriod([
        data.contractPeriod[0].toLocaleDateString(),
        data.contractPeriod[1].toLocaleDateString(),
      ]);
    }

    setEdit(false);
  };

  return (
    <div className="flex flex-col">
      <ContractCardHeader open={open} setOpen={setOpen} volunteer={data.volunteer} />

      {open && (
        <div className="bg-white shadow-sm p-4 mt-[-16px] pt-8 rounded flex flex-col gap-4 sm:flex-row">
          {/* datele contractului */}
          <div className="bg-gray-100 rounded flex-1 flex sm:self-baseline flex-col p-4 gap-4">
            <p className="font-robotoBold">{t('contract_data')}</p>
            {/* //todo: icon at the end of the input??? */}
            <Controller
              name="contractNumber"
              control={control}
              render={({ field: { value, onChange } }) => (
                <FormInput
                  type="d"
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

            {/* no controller here, as the value of this component is managed differently inside */}
            <DateRangePicker
              label={t('contract_period')}
              disabled={!edit}
              onChange={(value) => setValue('contractPeriod', value)}
            />

            {/* //? ce facem dupa ce editam astea? */}
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
              <span className="font-robotoBold">{organization?.name || ''}</span>{' '}
              {t('template_preview.p2.address')} {organization?.address || ''}{' '}
              {t('template_preview.p2.identified')}
              <span className="font-robotoBold"> {organization?.cui || '!!!!'}</span>
              {', '}
              {t('template_preview.p2.represented_by')}{' '}
              <span className="font-robotoBold">
                {' '}
                {organization?.legalRepresentative || '!!!!!!'}
              </span>
              {', '}
              {t('template_preview.p2.as')} {organization?.legalRepresentativeRole || '!!!!!!!!!'}{' '}
              {t('template_preview.p2.named')}{' '}
              <span className="italic">{t('template_preview.p2.organization')}</span>{' '}
            </p>

            <p>{t('template_preview.and')}</p>

            <p>
              <span className="font-robotoBold">{volunteer.name}</span>,{' '}
              {t('template_preview.p3.lives')} {volunteer.address}, {t('template_preview.p3.cnp')}{' '}
              <span className="font-robotoBold">{volunteer.cnp}</span>,{' '}
              {t('template_preview.p3.legitimate')} {volunteer.series} {t('template_preview.p3.no')}{' '}
              {volunteer.number}, {t('template_preview.p3.by')} {volunteer.institution},{' '}
              {t('template_preview.p3.at_date')} {volunteer.issuanceDate}
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

              {contractTerms && <ContentExpander fullContent={contractTerms} />}
            </div>
            <Signatures volunteer={volunteer} />
          </div>
        </div>
      )}
    </div>
  );
};
