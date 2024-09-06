import React, { useMemo } from 'react';
import PageLayout from '../layouts/PageLayout';
import PageHeader from '../components/PageHeader';
import { useNavigate } from 'react-router-dom';
import CardHeader from '../components/CardHeader';
import Card from '../layouts/CardLayout';
import CardBody from '../components/CardBody';
import Button from '../components/Button';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { OrganizationDetails } from '../components/contracts/OrganizationDetails';
import { ContractTemplatePreview } from '../components/contracts/ContractTemplatePreview';
import { useTranslation } from 'react-i18next';
import { FieldValues, useForm } from 'react-hook-form';
import { useOrganizationQuery } from '../services/organization/organization.service';
import { Tooltip } from 'react-tooltip';
import {
  IAddContractTemplatePayload,
  useAddContractTemplateMutation,
} from '../services/documents-templates/documents-templates.service';

export const CreateContractTemplate = () => {
  const navigate = useNavigate();

  const { t } = useTranslation(['doc_templates', 'general']);
  const {
    control,
    handleSubmit,
    reset,
    getValues,
    setError,
    formState: { errors },
  } = useForm();
  const { data: organization } = useOrganizationQuery();
  const isOrganizationDataComplete = useMemo(
    () =>
      organization?.name &&
      organization?.address &&
      organization?.cui &&
      organization?.legalReprezentativeFullName &&
      organization?.legalReprezentativeRole,
    [organization],
  );
  console.log('errors', errors);
  const { mutate: addContractTemplate, isLoading: isLoadingAddContractTemplate } =
    useAddContractTemplateMutation();

  const onSubmit = ({ templateName, contractTerms }: FieldValues) => {
    console.log('templateName', templateName);
    console.log('contractTerms', contractTerms);
    if (!contractTerms) {
      return setError('contractTerms', {
        type: 'required',
        message: t('required', { ns: 'general' }),
      });
    }
    const contractTemplateData = {
      name: templateName,
      organizationData: {
        officialName: organization?.name,
        registeredOffice: organization?.address,
        CUI: organization?.cui,
        legalRepresentativeName: organization?.legalReprezentativeFullName,
        legalRepresentativeRole: organization?.legalReprezentativeRole,
      },
      documentTerms: contractTerms,
    } as IAddContractTemplatePayload;
    addContractTemplate(contractTemplateData, {
      onSuccess: () => {
        //todo
      },
      onError: () => {
        //todo
      },
    });
  };

  const navigateBack = () => {
    // todo: this should send us back to the templates tab
    navigate('/documents/templates', { replace: true });
  };

  // TODO: links for <a/>

  return (
    <PageLayout>
      <PageHeader onBackButtonPress={navigateBack}>{t('title')}</PageHeader>

      {/* sub header text */}
      <div className="flex flex-col gap-2">
        <p className="text-cool-gray-500">
          {t('subheading.p1') + ' '}
          {/* //TODO: href */}
          <a className="font-roboto text-yellow hover:text-yellow-600 hover:underline underline-offset-2">
            {t('subheading.p1_link')}
          </a>
        </p>
        <p className="text-cool-gray-500">
          {t('subheading.p2') + ' '} {/* //TODO: href */}
          <a className="font-roboto text-yellow hover:text-yellow-600 hover:underline underline-offset-2">
            {t('subheading.p2_link')}
          </a>
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-row justify-between w-full items-center">
            <h2>{t('table_header.title')} </h2>
            <div className="flex flex-row gap-2">
              <Button
                label={t('table_header.download_uncompleted')}
                icon={<ArrowDownTrayIcon className="h-5 w-5 text-cool-gray-600" />}
                className="btn-outline-secondary text-cool-gray-600 "
                // TODO: descarca necompletat functionality
                onClick={() => {}}
              />
              {/* // TODO: save functionality */}
              <Button
                data-tooltip-id="save-btn-tooltip-incompleteData"
                disabled={!isOrganizationDataComplete || isLoadingAddContractTemplate}
                label={
                  isLoadingAddContractTemplate
                    ? t('loading', { ns: 'general' })
                    : t('table_header.save')
                }
                className="btn-primary"
                onClick={isOrganizationDataComplete ? handleSubmit(onSubmit) : undefined}
              />
              {!isOrganizationDataComplete && (
                <Tooltip
                  id="save-btn-tooltip-incompleteData"
                  content={
                    'Este necesar ca datele organizației să fie complete pentru a putea salva template-ul.'
                  }
                  place="top"
                  opacity={1}
                  style={{
                    maxWidth: '250px',
                    textAlign: 'center',
                    zIndex: 100_000,
                    backgroundColor: 'rgba(255,232,151,255)',
                    color: 'black',
                  }}
                />
              )}
            </div>
          </div>
        </CardHeader>

        {/* TABLE BODY */}
        <CardBody>
          <div className="flex flex-col gap-4 md:flex-row">
            <OrganizationDetails control={control} />
            <ContractTemplatePreview
              control={control}
              reset={reset}
              getValues={getValues}
              formErrors={errors}
            />
          </div>
        </CardBody>
      </Card>
    </PageLayout>
  );
  {
    /* {isLoading && <LoadingContent />} */
  }
};
