import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { TableColumn } from 'react-data-table-component';
import i18n from '../common/config/i18n';
import { formatDateWithTime } from '../common/utils/utils';
import Card from '../layouts/CardLayout';
import { IAnnouncementResponse } from '../services/announcement/announcement.api';
import { useAnnouncementResponses } from '../services/announcement/announcement.service';
import CardBody from './CardBody';
import CardHeader from './CardHeader';
import DataTableComponent from './DataTableComponent';

const PAGE_SIZE = 10;

const columns: TableColumn<IAnnouncementResponse>[] = [
  {
    id: 'user',
    name: i18n.t('announcement:responses.volunteer'),
    grow: 1,
    minWidth: '12rem',
    cell: (row) => (
      <div className="flex flex-col min-w-0 py-2">
        {row.volunteerId ? (
          <Link className="font-robotoBold truncate" to={`/volunteers/${row.volunteerId}`}>
            {row.user.name}
          </Link>
        ) : (
          <small className="font-robotoBold truncate">{row.user.name}</small>
        )}
        <small className="truncate text-cool-gray-500">{row.user.email}</small>
      </div>
    ),
  },
  {
    id: 'comment',
    name: i18n.t('announcement:responses.comment'),
    grow: 3,
    minWidth: '14rem',
    cell: (row) => <small className="whitespace-pre-line py-2">{row.comment}</small>,
  },
  {
    id: 'createdOn',
    name: i18n.t('announcement:responses.date'),
    grow: 1,
    minWidth: '9rem',
    selector: (row) => formatDateWithTime(row.createdOn),
  },
];

// VIC 2.0 (#504): what volunteers answered from the app, newest first
const AnnouncementResponses = ({ announcementId }: { announcementId: string }) => {
  const [page, setPage] = useState<number>(1);
  const { data, isLoading } = useAnnouncementResponses(announcementId, page, PAGE_SIZE);

  return (
    <Card>
      <CardHeader>
        <h2>{i18n.t('announcement:responses.title', { count: data?.meta?.totalItems ?? 0 })}</h2>
      </CardHeader>
      <CardBody>
        <DataTableComponent
          columns={columns}
          data={data?.items}
          loading={isLoading}
          pagination
          paginationPerPage={PAGE_SIZE}
          paginationTotalRows={data?.meta?.totalItems}
          paginationDefaultPage={page}
          onChangePage={setPage}
        />
      </CardBody>
    </Card>
  );
};

export default AnnouncementResponses;
