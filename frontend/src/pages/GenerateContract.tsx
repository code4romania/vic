import React, { useMemo, useState } from 'react';
import PageLayout from '../layouts/PageLayout';
import PageHeader from '../components/PageHeader';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Stepper } from '../components/Stepper';
import Button from '../components/Button';
import DocumentVolunteersTableWithQueryParams from '../containers/query/DocumentVolunteersTableWithQueryParams';
import { IDocumentTemplateListItem } from '../common/interfaces/template.interface';
import { IVolunteer } from '../common/interfaces/volunteer.interface';
import DocumentTemplatesTableSelectableWithQueryParams from '../containers/query/DocumentTemplatesTableSelectableWithQueryParams';
import { DocumentContractFillCards } from '../components/DocumentContractFillCards';
import { useAddDocumentContractMutation } from '../services/document-contracts/document-contracts.service';
import Modal from '../components/Modal';
import { LoadingContract } from '../components/LoadingContract';
import { CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { AxiosError } from 'axios';
import { format } from 'date-fns';

export interface IDocumentVolunteerData {
  documentNumber: number;
  documentDate: Date;
  documentPeriod: [Date, Date];
}

const SuccessModalContent = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('volunteering_contracts');
  return (
    <div className="flex flex-col gap-4 items-center pb-4">
      <div className="flex flex-row justify-center">
        <CheckCircleIcon width={70} height={70} className="text-yellow-500" />
      </div>
      <p className="text-center">{t('modal.success.description')}</p>
      <Button
        label={t('modal.success.button')}
        onClick={() => navigate('/documents/contracts')}
        className="btn-primary"
      />
    </div>
  );
};

const ErrorModalContent = ({
  sentContractsCount,
  totalNumberOfVolunteers,
}: {
  sentContractsCount: number;
  totalNumberOfVolunteers: number;
}) => {
  const { t } = useTranslation('volunteering_contracts');
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-row justify-center">
        <ExclamationCircleIcon width={70} height={70} className="text-red-400" />
      </div>
      <p className="text-center">
        {`${t('modal.loading.description', { value1: sentContractsCount, value2: totalNumberOfVolunteers })}`}
      </p>
      <p className="text-center">{t('modal.error.description')}</p>
    </div>
  );
};

export const GenerateContract = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<IDocumentTemplateListItem | null>(null);
  const [selectedVolunteers, setSelectedVolunteers] = useState<IVolunteer[]>([]);
  const [volunteersData, setVolunteersData] = useState<Record<string, IDocumentVolunteerData>>();
  const [isLoadingModalOpen, setIsLoadingModalOpen] = useState<boolean>(false);
  const [sentContractsCount, setSentContractsCount] = useState<number>(0);
  const [contractsWithErrors, setContractsWithErrors] = useState<Record<string, AxiosError>>();
  const [isLoadingAddDocumentContracts, setIsLoadingAddDocumentContract] = useState<boolean>(false);

  const { mutateAsync: addDocumentContract } = useAddDocumentContractMutation();

  const { t } = useTranslation(['volunteering_contracts', 'stepper']);
  const navigate = useNavigate();

  const steps = useMemo(
    () => [
      { id: '1', label: t('choose_template', { ns: 'stepper' }) },
      { id: '2', label: t('choose_volunteers', { ns: 'stepper' }) },
      { id: '3', label: t('fill', { ns: 'stepper' }) },
    ],
    [],
  );
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(new Array(steps.length).fill(false));

  const goToStep = (index: number) => {
    if (index <= currentStep) {
      setCurrentStep(index);
    }
  };

  const handleNext = () => {
    // mark the current step as completed
    const updatedSteps = [...completedSteps];
    updatedSteps[currentStep] = true;
    setCompletedSteps(updatedSteps);

    // move to the next step if possible
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }

    if (currentStep + 1 === 3) {
      handleSendContract();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
    // if we are on the first step and try to quit but a template has been selected -> display alert before navigating
    if (selectedTemplate) {
      if (window.confirm(t('generate.template_selected_alert'))) {
        navigate('/documents/contracts');
        return;
      }
    } else {
      navigate('/documents/contracts');
    }
  };

  const onSelectTemplate = (template: IDocumentTemplateListItem | null) => {
    setSelectedTemplate(template);
  };

  const onSelectVolunteers = (volunteers: IVolunteer[]) => {
    setSelectedVolunteers(volunteers);
  };

  const handleSetVolunteersData = (volunteerData: Record<string, IDocumentVolunteerData>) => {
    setVolunteersData((prevData) => ({ ...prevData, ...volunteerData }));
  };

  const canSendContract = useMemo(() => {
    // 1. Must have a template
    // 2. Must have volunteers
    // 3. Must have volunteers data for all volunteers
    return (
      selectedTemplate !== null &&
      selectedVolunteers.length > 0 &&
      volunteersData &&
      Object.keys(volunteersData).length === selectedVolunteers.length
    );
  }, [selectedTemplate, selectedVolunteers, volunteersData]);

  const handleSendContract = async () => {
    const success = [];
    const errors = {} as Record<string, AxiosError>;
    setIsLoadingModalOpen(true); // Open loading modal
    setIsLoadingAddDocumentContract(true);
    if (canSendContract) {
      const promises = selectedVolunteers.map(async (volunteer) => {
        try {
          if (!volunteersData || !volunteersData[volunteer.id]) {
            return;
          }
          await addDocumentContract({
            documentTemplateId: selectedTemplate?.id as string,
            volunteerId: volunteer.id,
            documentNumber: volunteersData[volunteer.id].documentNumber.toString(),
            documentDate: format(volunteersData[volunteer.id].documentDate, 'yyyy-MM-dd'),
            documentStartDate: format(volunteersData[volunteer.id].documentPeriod[0], 'yyyy-MM-dd'),
            documentEndDate: format(volunteersData[volunteer.id].documentPeriod[1], 'yyyy-MM-dd'),
          });
          success.push(volunteer.id);
          setSentContractsCount((prev) => prev + 1);
        } catch (error) {
          errors[volunteer.id] = error as AxiosError;
        }
      });

      await Promise.all(promises); // wait for all mutations to complete
    }
    setContractsWithErrors(errors);
    setIsLoadingAddDocumentContract(false);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <DocumentTemplatesTableSelectableWithQueryParams
            selectedTemplate={selectedTemplate}
            onSelectTemplate={onSelectTemplate}
          />
        );
      case 1:
        return (
          <DocumentVolunteersTableWithQueryParams
            selectedVolunteers={selectedVolunteers}
            setSelectedVolunteers={onSelectVolunteers}
          />
        );
      case 2:
        return (
          <DocumentContractFillCards
            volunteers={selectedVolunteers}
            template={selectedTemplate as IDocumentTemplateListItem}
            setSelectedVolunteers={setSelectedVolunteers}
            contractsWithErrors={contractsWithErrors}
            setVolunteerData={handleSetVolunteersData}
            volunteersData={volunteersData}
          />
        );
    }
  };

  const navigateBack = () => {
    navigate('/documents/contracts', { replace: true });
  };

  const canGoNext = useMemo(() => {
    switch (currentStep) {
      case 0:
        return selectedTemplate !== null && selectedTemplate !== undefined;
      case 1:
        return selectedVolunteers.length > 0;
      case 2:
        return canSendContract;
      default:
        return true;
    }
  }, [currentStep, selectedTemplate, selectedVolunteers, canSendContract]);

  const handleCloseModal = () => {
    // if we have errors -> close the modal and keep in the list only the volunteers with errors

    // keep only the volunteers with errors in the list
    if (contractsWithErrors && Object.keys(contractsWithErrors).length > 0) {
      const volunteerIdsWithError = Object.keys(contractsWithErrors);
      setSelectedVolunteers((selectedVolunteers) => {
        return selectedVolunteers.filter((v) => volunteerIdsWithError.includes(v.id));
      });

      setVolunteersData((v) => {
        const volunteersData = { ...v };
        for (const volunteerId of Object.keys(volunteersData)) {
          if (!volunteerIdsWithError.includes(volunteerId)) {
            delete volunteersData[volunteerId];
          }
        }

        return volunteersData;
      });
    }

    // if we have no volunteers with errors -> navigate to all contracts
    if (
      !contractsWithErrors ||
      (contractsWithErrors && Object.keys(contractsWithErrors).length === 0)
    ) {
      navigate('/documents/templates');
    }

    // reset
    setSentContractsCount(0);
    // todo: close modal on success and navigate to all contracts
    setIsLoadingModalOpen(false);
  };

  const handleNavigateBack = () => {
    if (window.confirm(t('back_alert'))) {
      navigateBack();
    }
  };

  return (
    <>
      <PageLayout>
        <PageHeader onBackButtonPress={handleNavigateBack}>{t('generate.title')}</PageHeader>
        <p className="text-sm text-gray-500">{t('dont_refresh')}</p>
        <Stepper
          steps={steps}
          currentStep={currentStep}
          completedSteps={completedSteps}
          goToStep={goToStep}
        />
        {/* template table */}
        {renderStep()}
        <div className="flex flex-row gap-4 justify-end">
          <Button
            label={currentStep === 0 ? t('generate.quit') : t('generate.prev_step')}
            onClick={handlePrevious}
            className="text-yellow-500"
          />
          <Button
            label={currentStep === 2 ? t('generate.send_contracts') : t('generate.next_step')}
            onClick={handleNext}
            disabled={!canGoNext}
            className="btn-primary self-center p-2 rounded disabled:bg-gray-300 disabled:text-white"
          />
        </div>
      </PageLayout>
      {isLoadingModalOpen && (
        <Modal
          onClose={handleCloseModal}
          title={
            isLoadingAddDocumentContracts
              ? t('modal.loading.title')
              : contractsWithErrors
                ? t('modal.error.title')
                : t('modal.success.title')
          }
          titleClassName="text-center"
        >
          {/* loading content */}
          {isLoadingAddDocumentContracts && (
            <>
              <LoadingContract />
              <p className="text-center">{`${t('modal.loading.description', { value1: sentContractsCount, value2: selectedVolunteers.length })}`}</p>
            </>
          )}
          {/* success content */}
          {!isLoadingAddDocumentContracts &&
            (!contractsWithErrors || Object.keys(contractsWithErrors).length === 0) && (
              <SuccessModalContent />
            )}
          {/* error content */}
          {!isLoadingAddDocumentContracts &&
            contractsWithErrors &&
            Object.keys(contractsWithErrors).length > 0 && (
              <ErrorModalContent
                sentContractsCount={sentContractsCount}
                totalNumberOfVolunteers={selectedVolunteers.length}
              />
            )}
        </Modal>
      )}
    </>
  );
};
