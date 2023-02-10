import React, { useEffect, useState } from 'react';
import PageLayout from '../layouts/PageLayout';
import Card from '../layouts/CardLayout';
import CardHeader from '../components/CardHeader';
import CardBody from '../components/CardBody';
import Button from '../components/Button';
import Tabs from '../components/Tabs';
import DataTableComponent from '../components/DataTableComponent';
import i18n from '../common/config/i18n';
import { ArrowDownTrayIcon, CheckIcon, EyeIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useRegistrationRequestsQuery } from '../services/registration-requests/registration-requests.service';
import { TableColumn } from 'react-data-table-component';
import Popover from '../components/Popover';

export interface IAccessRequest {
  id: string;
  logo: string;
  name: string;
  address: string;
  email: string;
  phone: string;
  createdOn: string;
}

const RegistrationRequestsTableHeader = [
  {
    id: 'name',
    name: i18n.t('general:name'),
    sortable: true,
    cell: (row: IAccessRequest) => (
      <div className="flex items-center gap-3 shrink-0">
        <img src={row.logo} className="w-10 h-10 logo" alt={`${row.name} picture`} />
        <small className="font-robotoBold">{row.name}</small>
      </div>
    ),
  },
  {
    id: 'contact',
    name: i18n.t('registration_requests:contact'),
    sortable: true,
    selector: (row: IAccessRequest) => `${row.email}\n${row.phone}`,
  },
  {
    id: 'location',
    name: i18n.t('general:location'),
    sortable: true,
    selector: (row: IAccessRequest) => row.address,
  },
  {
    id: 'createdOn',
    name: i18n.t('registration_requests:date'),
    sortable: true,
    selector: (row: IAccessRequest) => row.createdOn,
  },
];

// row actions
const onView = (row: IAccessRequest) => {
  alert(`Not yet implemented, ${row}`);
};

const onApprove = (row: IAccessRequest) => {
  console.log(`Not yet implemented, ${row}`);
};

const onReject = (row: IAccessRequest) => {
  alert(`Not yet implemented, ${row}`);
};

// menu items
const buildRegistrationRequestsActionColumn = (): TableColumn<IAccessRequest> => {
  const registrationRequestsMenuItems = [
    {
      label: i18n.t('registration_requests:modal.view'),
      icon: <EyeIcon className="menu-icon" />,
      onClick: onView,
    },
    {
      label: i18n.t('registration_requests:modal.approve'),
      icon: <CheckIcon className="menu-icon" />,
      onClick: onApprove,
    },
    {
      label: i18n.t('registration_requests:modal.reject'),
      icon: <XMarkIcon className="menu-icon" />,
      onClick: onReject,
      alert: true,
    },
  ];

  return {
    name: '',
    cell: (row: IAccessRequest) => (
      <Popover<IAccessRequest> row={row} items={registrationRequestsMenuItems} />
    ),
    width: '50px',
    allowOverflow: true,
  };
};

const RegistrationRequests = () => {
  const [filterStatus, setFilterStatus] = useState<'pending' | 'rejected'>('pending');
  const [page, setPage] = useState<number>();
  const [rowsPerPage, setRowsPerPage] = useState<number>();
  const [orderByColumn, setOrderByColumn] = useState<string>();
  const [orderDirection, setOrderDirection] = useState<OrderDirection>();

  const { data: registrationRequests, isLoading } = useRegistrationRequestsQuery(
    filterStatus,
    rowsPerPage as number,
    page as number,
    orderByColumn,
    orderDirection,
  );

  useEffect(() => {
    if (registrationRequests?.meta) {
      setPage(registrationRequests.meta.currentPage);
      setRowsPerPage(registrationRequests.meta.itemsPerPage);
      setOrderByColumn(registrationRequests.meta.orderByColumn);
      setOrderDirection(registrationRequests.meta.orderDirection);
    }
  }, []);

  const handleTabClick = (key: number) => {
    console.log(key);
  };

  return (
    <PageLayout>
      <h1>{i18n.t('registration_requests:title')}</h1>
      <Tabs
        tabs={[
          { value: i18n.t('registration_requests:options.requests'), key: 2 },
          { value: i18n.t('registration_requests:options.rejected_requests'), key: 3 },
        ]}
        onClick={handleTabClick}
      >
        <Card>
          <CardHeader>
            <div></div>
            <Button
              label={i18n.t('general:download_table')}
              icon={<ArrowDownTrayIcon className="h-5 w-5 text-cool-gray-600" />}
              className="btn-outline-secondary"
              onClick={() => alert('Not implemented')}
            />
          </CardHeader>
          <CardBody>
            <DataTableComponent
              columns={[
                ...RegistrationRequestsTableHeader,
                buildRegistrationRequestsActionColumn(),
              ]}
              data={registrationRequests?.items}
              loading={isLoading}
              pagination
              onChangePage={setPage}
              onChangeRowsPerPage={setRowsPerPage}
              page={page}
            />
          </CardBody>
        </Card>
      </Tabs>
    </PageLayout>
  );
};

export default RegistrationRequests;
