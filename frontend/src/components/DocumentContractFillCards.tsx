import React, { useEffect, useState } from 'react';
import { ContractCard } from './ContractCard';
import { FieldValues, useForm } from 'react-hook-form';
import { AutoFillContractCard } from './AutoFillContractCard';
import { IDocumentTemplate, IDocumentTemplateListItem } from '../common/interfaces/template.interface';
import { IVolunteer } from '../common/interfaces/volunteer.interface';
import { useDocumentTemplateByIdQuery } from '../services/documents-templates/documents-templates.service';
import LoadingContent from './LoadingContent';
import ConfirmationModal from './ConfirmationModal';
import { IDocumentVolunteerData } from '../pages/GenerateContract';

interface DocumentContractFillCardsProps {
  volunteers: IVolunteer[];
  template: IDocumentTemplateListItem;
  setSelectedVolunteers: (volunteers: IVolunteer[]) => void;
  setVolunteerData: (volunteerData: Record<string, IDocumentVolunteerData>) => void;
  volunteersData: Record<string, IDocumentVolunteerData> | undefined;
}

export const DocumentContractFillCards = ({ volunteers, template, setSelectedVolunteers, setVolunteerData, volunteersData }: DocumentContractFillCardsProps) => {
  const { control, reset, handleSubmit, watch, setValue } = useForm();
  const [startingNumber, setStartingNumber] = useState<number>();
  const [contractDate, setContractDate] = useState<Date>();
  const [contractPeriod, setContractPeriod] = useState<[Date, Date]>();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [volunteerToDelete, setVolunteerToDelete] = useState<string | null>(null);

  const { data: templateData, isLoading: isLoadingTemplate } = useDocumentTemplateByIdQuery(template.id);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleReset = () => {
    setStartingNumber(undefined);
    setContractDate(undefined);
    setContractPeriod(undefined);
    reset({
      startingNumber: '',
      contractDate: null,
      contractPeriod: [null, null],
    });
  };

  const onSubmitFillForm = ({ startingNumber, contractDate, contractPeriod }: FieldValues) => {
    if (startingNumber) {
      setStartingNumber(startingNumber);
    }
    if (contractDate) {
      setContractDate(contractDate);
    }
    if (contractPeriod) {
      setContractPeriod(contractPeriod);
    }
  };

  if (isLoadingTemplate) {
    return <LoadingContent />
  }

  const onDelete = (id: string) => {
    setVolunteerToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (volunteerToDelete) {
      setSelectedVolunteers(volunteers.filter(volunteer => volunteer.id !== volunteerToDelete));
      setIsDeleteModalOpen(false);
      setVolunteerToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setVolunteerToDelete(null);
  };

  const handleAddVolunteerData = (volunteerId: string, volunteerData: IDocumentVolunteerData) => {
    setVolunteerData({ [volunteerId]: volunteerData });
  };

  return (
    <>
      <AutoFillContractCard
        control={control}
        handleReset={handleReset}
        handleSubmit={handleSubmit}
        onSubmit={onSubmitFillForm}
        watch={watch}
        setValue={setValue}
      />

      <div className="flex flex-col gap-4">
        {volunteers.map((item, index) => (
          <ContractCard
            key={item.id}
            onDelete={onDelete}
            volunteer={item}
            template={templateData as IDocumentTemplate}
            initialNumber={startingNumber}
            initialDate={contractDate ? contractDate : undefined}
            initialPeriod={contractPeriod ? contractPeriod : undefined}
            isOpen={index === 0}
            saveVolunteerData={handleAddVolunteerData}
            volunteersData={volunteersData}
          />
        ))}
      </div>

      {isDeleteModalOpen && (
        <ConfirmationModal
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          title="Confirma eliminarea voluntarului"
          description="Esti sigur ca vrei sa elimini voluntarul din lista?"
          confirmBtnLabel="Da, elimină"
          confirmBtnClassName="btn-danger"
        />
      )}
    </>
  );
};
