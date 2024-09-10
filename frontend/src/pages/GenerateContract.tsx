import React, { useMemo, useState } from 'react';
import PageLayout from '../layouts/PageLayout';
import PageHeader from '../components/PageHeader';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Stepper } from '../components/Stepper';
import Button from '../components/Button';
import CardBody from '../components/CardBody';
import DataTableComponent from '../components/DataTableComponent';
import { ContractTemplate } from './ContractTemplates';
import Card from '../layouts/CardLayout';
import CardHeader from '../components/CardHeader';

const ContractTemplatesTableHeader = [
  {
    id: 'name',
    name: 'Nume',
    sortable: true,
    grow: 4,
    minWidth: '9rem',
    selector: (row: ContractTemplate) => row.name,
  },
  {
    id: 'uses',
    name: 'Utilizări',
    sortable: true,
    grow: 1,
    minWidth: '5rem',
    // todo: get uses count
    selector: () => 'TODO',
  },
  {
    id: 'last_used',
    name: 'Ultima utilizare',
    sortable: true,
    grow: 1,
    minWidth: '5rem',
    // todo: get last usage count
    selector: () => 'TODO',
  },
  {
    id: 'created_by',
    name: 'Creat de',
    sortable: true,
    grow: 1,
    minWidth: '5rem',
    selector: (row: ContractTemplate) => row.createdByAdmin.name,
  },
  {
    id: 'created_at',
    name: 'Data creării',
    sortable: true,
    grow: 1,
    minWidth: '5rem',
    // todo: get created_at date
    selector: () => 'TODO',
  },
];
const templates: ContractTemplate[] = [
  {
    id: '9a827436-e0b8-4763-8b04-ccff3f9b2757',
    name: 'Test Template Lucia',
    organizationData: {
      CUI: '1278133',
      officialName: 'Tenebru Diamonds Industry',
      registeredOffice: 'Strada Cazarmii NR. 3392',
      legalRepresentativeName: 'John Dave',
      legalRepresentativeRole: 'Admin',
    },
    documentTerms: '<p>Contract terms</p>',
    createdByAdmin: {
      id: '8f2a561d-982f-465f-8dfb-bb2e16c39be6',
      name: 'Galdo Gerald',
    },
  },
  {
    id: 'b3c45678-d9e0-4f12-a3b4-56c7d8e9f012',
    name: 'Standard Contract Template',
    organizationData: {
      CUI: '9876543',
      officialName: 'Global Solutions Inc.',
      registeredOffice: 'Main Street 123',
      legalRepresentativeName: 'Jane Smith',
      legalRepresentativeRole: 'CEO',
    },
    documentTerms: '<p>Standard contract terms and conditions</p>',
    createdByAdmin: {
      id: '1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p',
      name: 'Admin User',
    },
  },
  {
    id: 'c7d89012-e3f4-5g6h-i7j8-9k0l1m2n3o4p',
    name: 'Volunteer Agreement Template',
    organizationData: {
      CUI: '5432109',
      officialName: 'Community Helpers Association',
      registeredOffice: 'Volunteer Avenue 456',
      legalRepresentativeName: 'Mark Johnson',
      legalRepresentativeRole: 'Director',
    },
    documentTerms: '<p>Volunteer agreement terms</p>',
    createdByAdmin: {
      id: 'q1w2e3r4-t5y6-u7i8-o9p0-a1s2d3f4g5h6',
      name: 'Sarah Admin',
    },
  },
];

export const GenerateContract = () => {
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
  const onSelectTemplate = (template: ContractTemplate[]) => {
    console.log(template);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <Card>
            <CardHeader>
              <h2>{t('templates')}</h2>
            </CardHeader>
            <CardBody>
              <DataTableComponent
                // todo: action column
                columns={[...ContractTemplatesTableHeader]}
                data={templates}
                // loading={isLoadingContractTemplate}
                pagination
                // paginationPerPage={10}
                selectableRows
                selectableRowsSingle
                paginationTotalRows={templates.length}
                onSelectedRowsChange={onSelectTemplate}
                // paginationDefaultPage={query.page as number}
                // onChangeRowsPerPage={onRowsPerPageChange}
                // onChangePage={onChangePage}
                // onSort={onSort}
              />
            </CardBody>
          </Card>
        );
      case 1:
        return <div>Volunteers</div>;
    }
  };

  const navigateBack = () => {
    navigate('/documents/templates', { replace: true });
  };

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
        <Button label="Pasul anterior" onClick={handlePrevious} className="text-yellow" />
        <Button
          label="Pasul urmator"
          onClick={handleNext}
          className="bg-yellow text-white self-center p-2 rounded"
        />
      </div>
    </PageLayout>
  );
};
