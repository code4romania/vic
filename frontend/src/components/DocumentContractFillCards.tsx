import React, { useEffect, useState } from 'react';
import { ContractCard } from './ContractCard';
import { FieldValues, useForm } from 'react-hook-form';
import { AutoFillContractCard } from './AutoFillContractCard';
import { IDocumentTemplate, IDocumentTemplateListItem } from '../common/interfaces/template.interface';
import { IVolunteer } from '../common/interfaces/volunteer.interface';
import { useDocumentTemplateByIdQuery } from '../services/documents-templates/documents-templates.service';
import LoadingContent from './LoadingContent';
// Add this import
import ConfirmationModal from './ConfirmationModal'; // Adjust the import path as needed

interface DocumentContractFillCardsProps {
  volunteers: IVolunteer[];
  template: IDocumentTemplateListItem;
  setSelectedVolunteers: (volunteers: IVolunteer[]) => void;
}

export const DocumentContractFillCards = ({ volunteers, template, setSelectedVolunteers }: DocumentContractFillCardsProps) => {
  const { control, reset, handleSubmit } = useForm();
  const [startingNumber, setStartingNumber] = useState('');
  const [contractDate, setContractDate] = useState<Date | null>(null);
  const [contractPeriod, setContractPeriod] = useState<[Date | null, Date | null]>([null, null]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [volunteerToDelete, setVolunteerToDelete] = useState<string | null>(null);


  const { data: templateData, isLoading: isLoadingTemplate } = useDocumentTemplateByIdQuery(template.id);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleReset = () => {
    setStartingNumber('');
    setContractDate(null);
    setContractPeriod([null, null]);
    reset({
      startingNumber: '',
      contractDate: null,
      contractPeriod: [null, null],
    });
  };

  const onSubmit = ({ startingNumber, contractDate, contractPeriod }: FieldValues) => {
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


  return (
    <>
      <AutoFillContractCard
        control={control}
        handleReset={handleReset}
        handleSubmit={handleSubmit}
        onSubmit={onSubmit}
      />

      <div className="flex flex-col gap-4">
        {volunteers.map((item, index) => (
          <ContractCard
            key={item.id}
            onDelete={onDelete}
            volunteer={item}
            template={templateData as IDocumentTemplate}
            initialNumber={startingNumber ? String(Number(startingNumber) + index) : undefined}
            initialDate={contractDate}
            initialPeriod={contractPeriod}
            isOpen={index === 0}
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
