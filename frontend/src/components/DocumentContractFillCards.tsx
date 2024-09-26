import React, { useEffect, useState } from 'react';
import { ContractCard } from './ContractCard';
import { AutoFillContractCard } from './AutoFillContractCard';
import {
  IDocumentTemplate,
  IDocumentTemplateListItem,
} from '../common/interfaces/template.interface';
import { IVolunteer } from '../common/interfaces/volunteer.interface';
import { useDocumentTemplateByIdQuery } from '../services/documents-templates/documents-templates.service';
import LoadingContent from './LoadingContent';
import ConfirmationModal from './ConfirmationModal';
import { IDocumentVolunteerData } from '../pages/GenerateContract';
import { FieldValues } from 'react-hook-form';
import { AxiosError } from 'axios';

interface DocumentContractFillCardsProps {
  volunteers: IVolunteer[];
  template: IDocumentTemplateListItem;
  setSelectedVolunteers: (volunteers: IVolunteer[]) => void;
  setVolunteerData: (volunteerData: Record<string, IDocumentVolunteerData>) => void;
  volunteersData: Record<string, IDocumentVolunteerData> | undefined;
  contractsWithErrors?: Record<string, AxiosError>;
}

export const DocumentContractFillCards = ({
  volunteers,
  template,
  setSelectedVolunteers,
  setVolunteerData,
  volunteersData,
  contractsWithErrors,
}: DocumentContractFillCardsProps) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [volunteerToDelete, setVolunteerToDelete] = useState<string | null>(null);

  const { data: templateData, isLoading: isLoadingTemplate } = useDocumentTemplateByIdQuery(
    template.id,
  );

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const onSubmitFillForm = ({
    startingNumber,
    documentContractDate,
    documentContractPeriod,
  }: FieldValues) => {
    volunteers.forEach((volunteer, index) => {
      const volunteerData: IDocumentVolunteerData = {
        documentNumber: startingNumber ? +startingNumber + index : 0,
        documentDate: documentContractDate ? documentContractDate : undefined,
        documentPeriod: documentContractPeriod ? documentContractPeriod : undefined,
      };
      setVolunteerData({ [volunteer.id]: volunteerData });
    });
  };

  if (isLoadingTemplate) {
    return <LoadingContent />;
  }

  const onDelete = (id: string) => {
    setVolunteerToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (volunteerToDelete) {
      setSelectedVolunteers(volunteers.filter((volunteer) => volunteer.id !== volunteerToDelete));
      if (volunteersData) {
        delete volunteersData[volunteerToDelete];
      }
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
      <AutoFillContractCard onSubmit={onSubmitFillForm} />

      <div className="flex flex-col gap-4">
        {volunteers.map((item, index) => (
          <ContractCard
            key={item.id}
            onDelete={onDelete}
            volunteer={item}
            template={templateData as IDocumentTemplate}
            initialNumber={
              volunteersData && volunteersData[item.id]
                ? volunteersData[item.id]?.documentNumber
                : undefined
            }
            initialDate={
              volunteersData && volunteersData[item.id]
                ? volunteersData[item.id]?.documentDate
                : undefined
            }
            initialPeriod={
              volunteersData && volunteersData[item.id]
                ? volunteersData[item.id]?.documentPeriod
                : undefined
            }
            isOpen={index === 0}
            saveVolunteerData={handleAddVolunteerData}
            volunteersData={volunteersData}
            error={contractsWithErrors && contractsWithErrors[item.id]}
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
