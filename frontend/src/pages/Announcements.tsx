import React, { ComponentType, SVGProps, useEffect, useMemo, useState } from 'react';
import debounce from 'lodash.debounce';
import { useNavigate } from 'react-router-dom';
import {
  ChatBubbleLeftRightIcon,
  MagnifyingGlassIcon,
  MegaphoneIcon,
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
import { TabList } from '../components/Tabs';
import { AnnouncementsProps } from '../containers/query/AnnouncementsWithQueryParms';
import SelectFilter from '../containers/SelectFilter';
import LoadingContent from '../components/LoadingContent';
import EmptyContent from '../components/EmptyContent';
import LoadErrorContent from '../components/LoadErrorContent';
import AnnouncementCard from '../components/AnnouncementCard';
import AnnouncementPager from '../components/AnnouncementPager';
import { useValidationGate } from '../hooks/useValidationGate';

type HeroIcon = ComponentType<SVGProps<SVGSVGElement>>;

const STATUSES: AnnouncementStatus[] = [
  AnnouncementStatus.ACTIVE,
  AnnouncementStatus.INACTIVE,
  AnnouncementStatus.ARCHIVED,
];

type CounterKey = 'active' | 'inactive' | 'archived' | 'responses';

// Active / Inactive / Archived are counted on the tabs only (audit, major 11: no number twice);
// the responses have no tab, so they keep their card.
const COUNTERS: { key: CounterKey; Icon: HeroIcon; color: string }[] = [
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

const Announcements = ({ query, setQuery }: AnnouncementsProps) => {
  const [selectedIdForDeletion, setSelectedIdForDeletion] = useState<string>();
  const [searchWord, setSearchWord] = useState<string>(query?.search || '');

  const navigate = useNavigate();
  const { gate } = useValidationGate();

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

  const {
    data: counters,
    isError: countersFailed,
    refetch: refetchCounters,
  } = useAnnouncementCountersQuery();

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
            {...gate}
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
            value={counters ? `${counters[key] ?? 0}` : countersFailed ? '–' : undefined}
            icon={<Icon className={`w-5 h-5 ${color}`} aria-hidden="true" />}
            subtitle={i18n.t(`announcement:counters.info.${key}`)}
          />
        ))}
      </div>
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
        <TabList<AnnouncementStatus>
          tabs={STATUSES.map((key) => ({
            key,
            value: i18n.t(`announcement:tabs.${key}`),
            count: counters?.[key],
          }))}
          active={status}
          onSelect={(tab) => onStatusChange(tab.key)}
          countTone="neutral"
          fit
          ariaLabel={`${i18n.t('announcement:page.title')}`}
        />
        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3">
          <div className="relative sm:w-56">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-cool-gray-500" aria-hidden="true" />
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
      {!isBusy && !!announcementsError && (
        <Card>
          <LoadErrorContent onRetry={refetch} />
        </Card>
      )}
      {!isBusy && !announcementsError && !items.length && (
        <Card>
          <EmptyContent
            icon={<MegaphoneIcon className="w-6 h-6" />}
            title={`${i18n.t('announcement:page.empty_title')}`}
            description={
              query.search || query.type
                ? `${i18n.t('announcement:page.empty.search')}`
                : `${i18n.t(`announcement:page.empty.${status}`)}`
            }
            action={
              !query.search &&
              !query.type &&
              status === AnnouncementStatus.ACTIVE && (
                <Button
                  icon={<PlusIcon className="h-5 w-5" />}
                  className="btn-primary"
                  label={i18n.t('announcement:page.add')}
                  onClick={onAdd}
                  {...gate}
                />
              )
            }
          />
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
