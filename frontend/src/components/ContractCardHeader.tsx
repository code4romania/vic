import React from 'react';
import { TrashIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { Tooltip } from 'react-tooltip';
import LoadingContent from './LoadingContent';
import { IVolunteer } from '../common/interfaces/volunteer.interface';

interface ContractCardHeaderProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  volunteer: IVolunteer;
  onDelete: (id: string) => void;
  isLoading?: boolean;
  isError?: boolean;
  isErrorText?: string;
}

export const ContractCardHeader = ({
  open,
  setOpen,
  volunteer,
  onDelete,
  isLoading,
  isError,
  isErrorText,
}: ContractCardHeaderProps) => {

  if (isLoading) {
    return (
      <div
        className="bg-white rounded shadow flex flex-row justify-center items-center z-10 p-4"
        key={volunteer.user.userPersonalData?.cnp}
      >
        <LoadingContent />
      </div>
    );
  }

  return (
    <div key={volunteer.user.userPersonalData?.cnp} className="bg-white rounded shadow flex flex-row items-center z-10">
      <div
        className="flex flex-row justify-center items-center p-4 hover:cursor-pointer"
        onClick={() => onDelete(volunteer.id)}
      >
        <TrashIcon width={20} height={20} color="red" />
      </div>

      <div
        className="flex flex-row py-4 pr-4 gap-4 items-center flex-1 hover:cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        <div className="rounded-full">
          <img src={volunteer.user.profilePicture} className="w-8 h-8 rounded-full" />
        </div>
        {volunteer.user.name}
        <div className="flex flex-row gap-4 ml-auto z-20">
          {isError && (
            <>
              <ExclamationCircleIcon
                width={20}
                height={20}
                color="red"
                data-tooltip-id={`error-tooltip-${volunteer.user.userPersonalData?.cnp}`}
              />
              <Tooltip
                id={`error-tooltip-${volunteer.user.userPersonalData?.cnp}`}
                place="top"
                content={isErrorText}
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
