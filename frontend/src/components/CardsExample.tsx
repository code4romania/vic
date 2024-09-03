import React from 'react';
import { ContractCard } from './ContractCard';

const items = [
  {
    contract: {
      id: '0',
      name: 'Contract 0',
    },
    volunteer: {
      name: 'Emma Wilson',
      address: '123 Oak St, Springfield',
      cnp: '1234567890123',
      series: 'AB',
      number: '123456',
      institution: 'Springfield Police Department',
      issuanceDate: '2022-01-15',
      image: 'https://randomuser.me/api/portraits/women/0.jpg',
    },
  },
  {
    contract: {
      id: '1',
      name: 'Contract 1',
    },
    volunteer: {
      name: 'John Doe',
      address: '456 Elm St, Shelbyville',
      cnp: '2345678901234',
      series: 'CD',
      number: '234567',
      institution: 'Shelbyville City Hall',
      issuanceDate: '2021-11-30',
      image: 'https://randomuser.me/api/portraits/men/1.jpg',
      legalRepresentative: {
        name: 'Mariam Abbott',
        series: 'ABC',
        no: 123,
        tel: '0755675678',
      },
    },
  },
  {
    contract: {
      id: '2',
      name: 'Contract 2',
    },
    volunteer: {
      name: 'Jane Smith',
      address: '789 Maple Ave, Capital City',
      cnp: '3456789012345',
      series: 'EF',
      number: '345678',
      institution: 'Capital City Police Department',
      issuanceDate: '2023-03-22',
      image: 'https://randomuser.me/api/portraits/women/2.jpg',
    },
  },
  {
    contract: {
      id: '3',
      name: 'Contract 3',
    },
    volunteer: {
      name: 'Alice Johnson',
      address: '101 Pine Rd, Oakville',
      cnp: '4567890123456',
      series: 'GH',
      number: '456789',
      institution: 'Oakville Municipal Office',
      issuanceDate: '2022-07-10',
      image: 'https://randomuser.me/api/portraits/women/3.jpg',
    },
  },
  {
    contract: {
      id: '4',
      name: 'Contract 4',
    },
    volunteer: {
      name: 'Bob Brown',
      address: '202 Cedar Ln, Rivertown',
      cnp: '5678901234567',
      series: 'IJ',
      number: '567890',
      institution: 'Rivertown Police Station',
      issuanceDate: '2023-01-05',
      image: 'https://randomuser.me/api/portraits/men/4.jpg',
    },
  },
  {
    contract: {
      id: '5',
      name: 'Contract 5',
    },
    volunteer: {
      name: 'Charlie Davis',
      address: '303 Birch Blvd, Hillside',
      cnp: '6789012345678',
      series: 'KL',
      number: '678901',
      institution: 'Hillside City Hall',
      issuanceDate: '2022-09-18',
      image: 'https://randomuser.me/api/portraits/men/5.jpg',
    },
  },
];

export const CardsExample = () => {
  return (
    <div className="bg-gray-100  flex flex-col gap-4 p-4">
      {items.map((item) => (
        <ContractCard key={item.contract.id} data={item} />
      ))}
    </div>
  );
};
