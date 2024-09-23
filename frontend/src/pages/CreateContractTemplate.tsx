import React, { useEffect, useMemo } from 'react';
import PageLayout from '../layouts/PageLayout';
import PageHeader from '../components/PageHeader';
import { useNavigate, useParams } from 'react-router-dom';
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
  useDocumentTemplateByIdQuery,
} from '../services/documents-templates/documents-templates.service';
import { IDocumentTemplate } from '../common/interfaces/template.interface';

interface CreateContractTemplateProps {
  template?: IDocumentTemplate;
  readonly?: boolean;
}

export const CreateContractTemplate = ({ readonly }: CreateContractTemplateProps) => {
  const { id } = useParams();

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

  const { data: template } = useDocumentTemplateByIdQuery(id);
  const contractTerms = getValues('contractTerms');

  useEffect(() => {
    if (template) {
      reset({
        templateName: template.name,
        contractTerms: template.documentTerms,
      });
    }
  }, [template]);

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
  const { mutate: addContractTemplate, isLoading: isLoadingAddContractTemplate } =
    useAddContractTemplateMutation();

  const onSubmit = ({ templateName, contractTerms }: FieldValues) => {
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
    navigate('/documents/templates', { replace: true });
  };

  return (
    <PageLayout>
      <PageHeader onBackButtonPress={navigateBack}>{readonly ? t('view_title') : template ? t('edit_title') : t('title')}</PageHeader>

      {/* sub header text */}
      <div className="flex flex-col gap-2">
        <p className="text-cool-gray-500">
          {t('subheading.p1') + ' '}
          {/* //TODO: href */}
          <a className="font-roboto text-yellow-600 hover:text-yellow-600 hover:underline underline-offset-2">
            {t('subheading.p1_link')}
          </a>
        </p>
        <p className="text-cool-gray-500">
          {t('subheading.p2') + ' '} {/* //TODO: href */}
          <a className="font-roboto text-yellow-600 hover:text-yellow-600 hover:underline underline-offset-2">
            {t('subheading.p2_link')}
          </a>
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-row justify-between w-full items-center">
            <h2>{t('table_header.title')} </h2>
            {!readonly && <div className="flex flex-row gap-2">
              <Button
                label={t('table_header.download_uncompleted')}
                icon={<ArrowDownTrayIcon className="h-5 w-5 text-cool-gray-600" />}
                className="btn-outline-secondary text-cool-gray-600 "
                // TODO: descarca necompletat functionality
                onClick={() => { }}
              />
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
            </div>}
          </div>
        </CardHeader>

        {/* TABLE BODY */}
        <CardBody>
          <div className="flex flex-col gap-4 md:flex-row">
            <OrganizationDetails control={control} readonly={readonly} />
            <ContractTemplatePreview
              control={control}
              reset={reset}
              getValues={getValues}
              formErrors={errors}
              readonly={readonly}
              termsValue={contractTerms}
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
