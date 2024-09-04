import React from 'react';
import { TrashIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { IMockVolunteer } from './ContractCard';
import { Tooltip } from 'react-tooltip';

interface ContractCardHeaderProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  volunteer: IMockVolunteer;
  // todo: onDelete
}

export const ContractCardHeader = ({ open, setOpen, volunteer }: ContractCardHeaderProps) => {
  // todo: remove isError from here and use the right thing instead
  const isError = true;

  return (
    <div key={volunteer.cnp} className="bg-white rounded shadow flex flex-row items-center z-10">
      <div
        className="flex flex-row justify-center items-center p-4 hover:cursor-pointer"
        onClick={() => console.log('delete item')}
      >
        <TrashIcon width={20} height={20} color="red" />
      </div>

      <div
        className="flex flex-row py-4 pr-4 gap-4 items-center flex-1 hover:cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        <div className="rounded-full">
          <img src={volunteer.image} className="w-8 h-8 rounded-full" />
        </div>
        {volunteer.name}
        <div className="flex flex-row gap-4 ml-auto z-20">
          {isError && (
            <>
              <ExclamationCircleIcon
                width={20}
                height={20}
                color="red"
                data-tooltip-id={`error-tooltip-${volunteer.cnp}`}
              />
              <Tooltip
                id={`error-tooltip-${volunteer.cnp}`}
                place="top"
                content={
                  'Exista date lipsa la generarea contractului pentru acest voluntar. Va rugam...'
                }
                arrowColor="red"
                border="2px solid red"
                opacity={1}
                style={{
                  maxWidth: '200px',
                  zIndex: 100_000,
                  backgroundColor: 'white',
                  color: 'black',
                }}
              />
            </>
          )}

          {open ? (
            <ChevronUpIcon width={16} height={16} />
          ) : (
            <ChevronDownIcon width={16} height={16} />
          )}
        </div>
      </div>
    </div>
  );
};
