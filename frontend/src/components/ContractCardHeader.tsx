import React from 'react';
import { TrashIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid';
import { IMockVolunteer } from './ContractCard';

interface ContractCardHeaderProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  volunteer: IMockVolunteer;
  // todo: onDelete
}

export const ContractCardHeader = ({ open, setOpen, volunteer }: ContractCardHeaderProps) => {
  return (
    <div
      key={volunteer.cnp}
      className="bg-white rounded shadow p-4 flex flex-row gap-4 items-center hover:cursor-pointer z-10"
      onClick={() => setOpen(!open)}
    >
      <TrashIcon width={20} height={20} color="red" onClick={() => console.log('delete item')} />
      <div className="rounded-full">
        <img src={volunteer.image} className="w-8 h-8 rounded-full" />
      </div>
      {volunteer.name}
      {open ? (
        <ChevronUpIcon width={16} height={16} className="ml-auto" />
      ) : (
        <ChevronDownIcon width={16} height={16} className="ml-auto" />
      )}
    </div>
  );
};
