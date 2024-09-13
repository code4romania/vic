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
import DocumentTemplatesTableWithQueryParams from '../containers/query/DocumentTemplatesTableWithQueryParams';
import { DocumentContractFillCards } from '../components/DocumentContractFillCards';
// import { ContractTemplate } from './ContractTemplates';
// import { IVolunteer } from '../common/interfaces/volunteer.interface';

export const GenerateContract = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<IDocumentTemplateListItem | null>(null);
  const [selectedVolunteers, setSelectedVolunteers] = useState<IVolunteer[]>([]);

  const { t } = useTranslation(['volunteering_contracts', 'stepper']);
  const navigate = useNavigate();

  const steps = useMemo(
    () => [
      { id: '1', label: t('choose_template', { ns: 'stepper' }) },
      { id: '2', label: t('choose_volunteers', { ns: 'stepper' }) },
      { id: '3', label: t('fill', { ns: 'stepper' }) },
      { id: '4', label: t('attachments', { ns: 'stepper' }) },
      { id: '5', label: t('complete', { ns: 'stepper' }) },
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
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSelectTemplate = (template: IDocumentTemplateListItem | null) => {
    setSelectedTemplate(template);
  };

  const onSelectVolunteers = (volunteers: IVolunteer[]) => {
    setSelectedVolunteers(volunteers);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <DocumentTemplatesTableWithQueryParams selectedTemplate={selectedTemplate} onSelectTemplate={onSelectTemplate} />
        );
      case 1:
        return <DocumentVolunteersTableWithQueryParams selectedVolunteers={selectedVolunteers} setSelectedVolunteers={onSelectVolunteers} />
      case 2:
        return <DocumentContractFillCards volunteers={selectedVolunteers} template={selectedTemplate as IDocumentTemplateListItem} setSelectedVolunteers={setSelectedVolunteers} />
    }
  };

  const navigateBack = () => {
    navigate('/documents/templates', { replace: true });
  };

  const canGoNext = useMemo(() => {
    switch (currentStep) {
      case 0:
        return selectedTemplate !== null && selectedTemplate !== undefined;
      case 1:
        return selectedVolunteers.length > 0;
      case 2:
        return selectedVolunteers.length > 0;
      default:
        return true;
    }
  }, [currentStep, selectedTemplate, selectedVolunteers]);

  return (
    <PageLayout>
      <PageHeader onBackButtonPress={navigateBack}>{t('generate.title')}</PageHeader>
      <Stepper
        steps={steps}
        currentStep={currentStep}
        completedSteps={completedSteps}
        goToStep={goToStep}
      />
      {/* template table */}
      {renderStep()}
      <div className="flex flex-row gap-4 justify-end">
        <Button label={currentStep === 0 ? 'Renunta' : 'Pasul anterior'} onClick={handlePrevious} className="text-yellow-500" />
        <Button
          label="Pasul urmator"
          onClick={handleNext}
          disabled={!canGoNext}
          className="bg-yellow text-white self-center p-2 rounded disabled:bg-gray-300 disabled:text-white"
        />
      </div>
    </PageLayout>
  );
};
