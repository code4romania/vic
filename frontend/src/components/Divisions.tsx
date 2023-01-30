import React from 'react';
import { IUsername } from '../common/interfaces/username.interface';
import i18n from '../common/config/i18n';
// import { formatDate } from '../common/utils/utils';
import Card from '../layouts/CardLayout';
import CardHeader from './CardHeader';
import CardBody from './CardBody';
import { PlusIcon } from '@heroicons/react/24/outline';

export enum DivisionType {
  Branch = 'branch',
  Department = 'department',
  Role = 'role',
}

export interface IDivision {
  name: string;
  createdBy: IUsername;
  membersCount: number;
  createdOn: Date;
}

// const DivisionTableHeader = [
//   {
//     id: 'name',
//     name: i18n.t('general:name'),
//     sortable: true,
//     grow: 2,
//     minWidth: '15rem',
//     selector: (row: IDivision) => row.name,
//   },
//   {
//     id: 'membersCount',
//     name: i18n.t('division:members'),
//     sortable: true,
//     grow: 2,
//     minWidth: '15rem',
//     selector: (row: IDivision) => row.membersCount,
//   },
//   {
//     id: 'createdBy.name',
//     name: i18n.t('general:created_by'),
//     sortable: true,
//     grow: 2,
//     minWidth: '15rem',
//     selector: (row: IDivision) => row.createdBy.name,
//   },
//   {
//     id: 'createdOn',
//     name: i18n.t('general:created_on'),
//     sortable: true,
//     grow: 2,
//     minWidth: '15rem',
//     selector: (row: IDivision) => formatDate(row.createdOn),
//   },
// ];

const Divisions = () => {
  const onAdd = () => {
    alert('Not yet implemented');
  };

  // row actions
  //   const onView = (row: IDivision) => {
  //     alert('Not yet implemented');
  //   };

  //   const onEdit = (row: IDivision) => {
  //     alert('Not yet implemented');
  //   };

  //   const onDelete = (row: IDivision) => {
  //     alert('Not yet implemented');
  //   };

  return (
    <Card>
      <CardHeader>
        <h3>Test header</h3>
        <button onClick={onAdd}>
          {<PlusIcon className="h-5 w-5" />}
          {i18n.t('general:add')}
        </button>
      </CardHeader>
      <CardBody>
        <div></div>
      </CardBody>
    </Card>
  );
};

export default Divisions;
