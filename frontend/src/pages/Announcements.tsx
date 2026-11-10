import React, { ComponentType, SVGProps, useEffect, useMemo, useState } from 'react';
import debounce from 'lodash.debounce';
import { useNavigate } from 'react-router-dom';
import {
  ArchiveBoxIcon,
  ChatBubbleLeftRightIcon,
  EyeIcon,
  EyeSlashIcon,
  MagnifyingGlassIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import PageHeader from '../components/PageHeader';
import PageLayout from '../layouts/PageLayout';
import i18n from '../common/config/i18n';
import Card from '../layouts/CardLayout';
import Button from '../components/Button';
import { IAnnouncement } from '../common/interfaces/announcement.interface';
import { AnnouncementStatus, AnnouncementType } from '../common/enums/announcement-status.enum';
import { classNames } from '../common/utils/utils';
import {
  useAnnouncements,
  useDeleteAnnouncementMutation,
  useChangeAnnouncementStatusMutation,
  useAnnouncementCountersQuery,
} from '../services/announcement/announcement.service';
import StatisticsCard from '../components/StatisticsCard';
import { AnnouncementStatusAction } from '../services/announcement/announcement.api';
import { OrderDirection } from '../common/enums/order-direction.enum';
import { useErrorToast, useSuccessToast } from '../hooks/useToast';
import { InternalErrors } from '../common/errors/internal-errors.class';
import ConfirmationModal from '../components/ConfirmationModal';
import { SelectItem } from '../components/Select';
import { AnnouncementsProps } from '../containers/query/AnnouncementsWithQueryParms';
import SelectFilter from '../containers/SelectFilter';
import LoadingContent from '../components/LoadingContent';
import AnnouncementCard from '../components/AnnouncementCard';
import AnnouncementPager from '../components/AnnouncementPager';

type HeroIcon = ComponentType<SVGProps<SVGSVGElement>>;

const STATUSES: { status: AnnouncementStatus; Icon: HeroIcon }[] = [
  { status: AnnouncementStatus.ACTIVE, Icon: EyeIcon },
  { status: AnnouncementStatus.INACTIVE, Icon: EyeSlashIcon },
  { status: AnnouncementStatus.ARCHIVED, Icon: ArchiveBoxIcon },
];

type CounterKey = 'active' | 'inactive' | 'archived' | 'responses';

const COUNTERS: { key: CounterKey; Icon: HeroIcon; color: string }[] = [
  { key: 'active', Icon: EyeIcon, color: 'text-figure-green' },
  { key: 'inactive', Icon: EyeSlashIcon, color: 'text-cool-gray-500' },
  { key: 'archived', Icon: ArchiveBoxIcon, color: 'text-figure-amber' },
  { key: 'responses', Icon: ChatBubbleLeftRightIcon, color: 'text-navy' },
];

const TYPE_OPTIONS: SelectItem<string>[] = Object.values(AnnouncementType).map((type) => ({
  key: type,
  value: i18n.t(`announcement:type.${type}`),
}));

// Name reads best A to Z; dates newest first.
const SORT_OPTIONS: SelectItem<string>[] = [
  'updatedOn',
  'publishedOn',
  'displayStartDate',
  'name',
].map((key) => ({ key, value: i18n.t(`announcement:page.sort_options.${key}`) }));

const isStatus = (value?: string | null): value is AnnouncementStatus =>
  Object.values(AnnouncementStatus).includes(value as AnnouncementStatus);

// The page's main tabs, one per status, with how many announcements each holds.
const StatusTabs = ({
  active,
  counts,
  onChange,
}: {
  active: AnnouncementStatus;
  counts?: Partial<Record<AnnouncementStatus, number>>;
  onChange: (status: AnnouncementStatus) => void;
}) => (
  <div
    role="tablist"
    aria-label={`${i18n.t('announcement:page.title')}`}
    className="flex gap-1 p-1 rounded-xl bg-cool-gray-200/70 w-full sm:w-auto self-start"
  >
    {STATUSES.map(({ status, Icon }) => {
      const selected = status === active;
      return (
        <button
          key={status}
          type="button"
          role="tab"
          aria-selected={selected}
          onClick={() => onChange(status)}
          className={classNames(
            selected
              ? 'bg-white text-cool-gray-900 shadow-card'
              : 'text-cool-gray-600 hover:text-cool-gray-900',
            'flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-robotoMedium whitespace-nowrap',
          )}
        >
          <Icon className="hidden sm:block w-4 h-4" aria-hidden="true" />
          {i18n.t(`announcement:tabs.${status}`)}
          <span
            className={classNames(
              selected ? 'bg-navy text-white' : 'bg-white text-cool-gray-700',
              'min-w-[1.25rem] h-5 px-1.5 rounded-full text-xs font-robotoBold flex items-center justify-center',
            )}
          >
            {counts?.[status] ?? '-'}
          </span>
        </button>
      );
    })}
  </div>
);

const Announcements = ({ query, setQuery }: AnnouncementsProps) => {
  const [selectedIdForDeletion, setSelectedIdForDeletion] = useState<string>();
  const [searchWord, setSearchWord] = useState<string>(query?.search || '');

  const navigate = useNavigate();

  // the tabs always show one status; active by default
  const status = isStatus(query?.status) ? query.status : AnnouncementStatus.ACTIVE;
  const page = (query.page as number) || 1;

  const {
    data: announcements,
    isLoading: isAnnouncementsLoading,
    error: announcementsError,
    refetch,
  } = useAnnouncements(
    query.limit as number,
    page,
    query.orderBy as string,
    query.orderDirection as OrderDirection,
    query.search,
    status,
    query?.type as AnnouncementType,
  );

  const { data: counters, refetch: refetchCounters } = useAnnouncementCountersQuery();

  const { mutateAsync: changeStatus, isLoading: isUpdateAnnouncementLoading } =
    useChangeAnnouncementStatusMutation();

  const { mutateAsync: deleteAnnouncement, isLoading: isDeleteAnnouncementLoading } =
    useDeleteAnnouncementMutation();

  useEffect(() => {
    if (announcementsError) {
      useErrorToast(
        InternalErrors.ANNOUNCEMENT_ERRORS.getError(announcementsError.response?.data.code_error),
      );
    }
  }, [announcementsError]);

  const onDebouncedSearch = useMemo(
    () => debounce((search: string) => setQuery({ search, page: 1 }), 800),
    [],
  );

  useEffect(() => () => onDebouncedSearch.cancel(), []);

  const onAdd = () => navigate('add');

  const onEdit = (row: IAnnouncement) => navigate(`${row.id}/edit`);

  const onView = (row: IAnnouncement) => navigate(`${row.id}`);

  // a new announcement that starts from this one's content
  const onDuplicate = (row: IAnnouncement) => navigate('add', { state: { duplicateOf: row } });

  const onChangeStatus = (row: IAnnouncement, action: AnnouncementStatusAction) => {
    changeStatus(
      { id: row.id, action },
      {
        onSuccess: () => {
          useSuccessToast(i18n.t(`announcement:submit.messages.${action}`));
          refetch();
          refetchCounters();
        },
        onError: (error) => {
          useErrorToast(
            InternalErrors.ANNOUNCEMENT_ERRORS.getError(error.response?.data.code_error),
          );
        },
      },
    );
  };

  const onDelete = (row: IAnnouncement) => setSelectedIdForDeletion(row.id);

  const onDeleteAnnouncement = () => {
    if (selectedIdForDeletion) {
      deleteAnnouncement(selectedIdForDeletion, {
        onSuccess: () => {
          useSuccessToast(i18n.t('announcement:submit.messages.delete'));
          refetch();
          refetchCounters();
        },
        onError: (error) => {
          useErrorToast(
            InternalErrors.ANNOUNCEMENT_ERRORS.getError(error.response?.data.code_error),
          );
        },
        onSettled: () => {
          setSelectedIdForDeletion(undefined);
        },
      });
    }
  };

  const onSearchChange = (value: string) => {
    setSearchWord(value);
    onDebouncedSearch(value);
  };

  const onStatusChange = (next: AnnouncementStatus) => setQuery({ status: next, page: 1 });

  const onTypeChange = (type: SelectItem<string> | undefined) =>
    setQuery({ type: type?.key, page: 1 });

  const onSortChange = (sort: SelectItem<string> | undefined) =>
    setQuery({
      orderBy: sort?.key,
      orderDirection: sort?.key === 'name' ? OrderDirection.ASC : OrderDirection.DESC,
      page: 1,
    });

  const items = announcements?.items ?? [];
  const pages = announcements?.meta?.totalPages ?? 0;
  const isBusy =
    isAnnouncementsLoading || isUpdateAnnouncementLoading || isDeleteAnnouncementLoading;

  return (
    <PageLayout>
      <PageHeader
        subtitle={`${i18n.t('announcement:page.subtitle')}`}
        actions={
          <Button
            icon={<PlusIcon className="h-5 w-5" />}
            className="btn-primary"
            label={i18n.t('announcement:page.add')}
            onClick={onAdd}
          />
        }
      >
        {i18n.t('announcement:page.title')}
      </PageHeader>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 xl:gap-6">
        {COUNTERS.map(({ key, Icon, color }) => (
          <StatisticsCard
            key={key}
            label={`${i18n.t(`announcement:counters.${key}`)}`}
            value={`${counters?.[key] ?? '-'}`}
            icon={<Icon className={`w-5 h-5 ${color}`} aria-hidden="true" />}
            info={
              <span className="text-cool-gray-500 font-roboto">
                {i18n.t(`announcement:counters.info.${key}`)}
              </span>
            }
          />
        ))}
      </div>
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
        <StatusTabs active={status} counts={counters} onChange={onStatusChange} />
        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3">
          <div className="relative sm:w-56">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-cool-gray-400" aria-hidden="true" />
            </div>
            <input
              type="search"
              className="w-full pl-10"
              aria-label={`${i18n.t('announcement:page.search')}`}
              placeholder={`${i18n.t('announcement:page.search')}`}
              value={searchWord}
              onChange={(event) => onSearchChange(event.target.value)}
            />
          </div>
          <div className="sm:w-44">
            <SelectFilter
              ariaLabel={`${i18n.t('announcement:header.type')}`}
              placeholder={`${i18n.t('announcement:page.all_types')}`}
              options={TYPE_OPTIONS}
              defaultValue={query.type}
              onChange={onTypeChange}
              allowDeselect
            />
          </div>
          <div className="sm:w-52">
            <SelectFilter
              ariaLabel={`${i18n.t('announcement:page.sort')}`}
              placeholder={`${i18n.t('announcement:page.sort')}`}
              options={SORT_OPTIONS}
              defaultValue={query.orderBy}
              onChange={onSortChange}
            />
          </div>
        </div>
      </div>
      {isBusy && !items.length && <LoadingContent />}
      {!isBusy && !items.length && (
        <Card>
          <p className="p-8 text-center text-cool-gray-500">
            {query.search || query.type
              ? i18n.t('announcement:page.empty.search')
              : i18n.t(`announcement:page.empty.${status}`)}
          </p>
        </Card>
      )}
      {items.length > 0 && (
        <div className={classNames('flex flex-col gap-4', isBusy ? 'opacity-60' : '')}>
          {items.map((announcement) => (
            <AnnouncementCard
              key={announcement.id}
              announcement={announcement}
              onView={onView}
              onEdit={onEdit}
              onDuplicate={onDuplicate}
              onChangeStatus={onChangeStatus}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
      {pages > 1 && (
        <AnnouncementPager
          page={page}
          pages={pages}
          onChange={(next) => setQuery({ page: next })}
        />
      )}
      {selectedIdForDeletion && (
        <ConfirmationModal
          title={i18n.t('announcement:modal.title')}
          description={i18n.t('announcement:modal.description')}
          confirmBtnLabel={i18n.t('general:delete')}
          confirmBtnClassName="btn-danger"
          onClose={setSelectedIdForDeletion.bind(null, undefined)}
          onConfirm={onDeleteAnnouncement}
        />
      )}
    </PageLayout>
  );
};

export default Announcements;
