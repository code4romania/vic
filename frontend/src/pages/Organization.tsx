import React, { useEffect } from 'react';
import { useErrorToast } from '../hooks/useToast';
import PageLayout from '../layouts/PageLayout';
import { useOrganizationQuery } from '../services/organization/organization.service';
import { InternalErrors } from '../common/errors/internal-errors.class';
import i18n from '../common/config/i18n';
import EmptyContent from '../components/EmptyContent';
import LoadingContent from '../components/LoadingContent';
import PageHeader from '../components/PageHeader';
import { DivisionType } from '../common/enums/division-type.enum';
import Tabs from '../components/Tabs';
import { SelectItem } from '../components/Select';
import { useNavigate } from 'react-router-dom';
import Card from '../layouts/CardLayout';
import CardHeader from '../components/CardHeader';
import Button from '../components/Button';
import { PencilIcon } from '@heroicons/react/24/outline';
import CardBody from '../components/CardBody';
import FormLayout from '../layouts/FormLayout';
import Paragraph from '../components/Paragraph';
import FormInput from '../components/FormInput';
import FormTextarea from '../components/FormTextarea';
import DivisionTable from '../containers/query/DivisionTableWithQueryParams';
import { OrganizationTableProps } from '../containers/query/OrganizationWithQueryParam';

export const DivisionsTabs: SelectItem<DivisionType>[] = [
  { key: DivisionType.BRANCH, value: i18n.t(`division:table.title.branch`) },
  { key: DivisionType.DEPARTMENT, value: i18n.t('division:table.title.department') },
  { key: DivisionType.ROLE, value: i18n.t('division:table.title.role') },
];

const Organization = ({ query, setQuery }: OrganizationTableProps) => {
  const navigate = useNavigate();

  const {
    data: organization,
    error: organizationError,
    isLoading: isOrganizationLoading,
  } = useOrganizationQuery();

  // error handling
  useEffect(() => {
    // map error messages for ORGANIZATION fetch
    if (organizationError) {
      useErrorToast(
        InternalErrors.ORGANIZATION_ERRORS.getError(organizationError.response?.data.code_error),
        'organization_error',
      );
    }
  }, [organizationError]);

  const onTabClick = (id: DivisionType) => {
    const selectedTab = DivisionsTabs.find((tab) => tab.key === id)?.key as DivisionType;
    setQuery({
      type: selectedTab,
    });
  };

  const onEditButtonClick = () => {
    navigate('edit');
  };

  return (
    <PageLayout>
      <PageHeader>{i18n.t('side_menu:options.organization')}</PageHeader>
      {/* fetching organization data */}
      {isOrganizationLoading && <LoadingContent />}
      {/* error while fetching organization data */}
      {organizationError && (
        <EmptyContent
          description={InternalErrors.ORGANIZATION_ERRORS.getError(
            organizationError.response?.data.code_error,
          )}
        />
      )}
      {/* show organization data */}
      {organization && (
        <Card>
          <CardHeader>
            <h2>{i18n.t('organization:title.view')}</h2>
            <Button
              className="btn-outline-secondary w-20"
              label={i18n.t('general:edit', { item: '' })}
              icon={<PencilIcon className="h-5 w-5 text-cool-gray-500" />}
              onClick={onEditButtonClick}
            />
          </CardHeader>
          <CardBody>
            <FormLayout>
              <Paragraph title={i18n.t('organization:title.view')}>
                {i18n.t('organization:subtitle')}
              </Paragraph>
              <div className="flex flex-col gap-1">
                <small className="text-cool-gray-500">{i18n.t('organization:logo')}</small>
                <img
                  src={organization.logo || 'logo.svg'}
                  alt="Organization Logo"
                  className="h-28 object-contain self-start p-2"
                />
              </div>
              <FormInput
                label={i18n.t('organization:name') || ''}
                value={organization.name}
                readOnly
              />
              <FormInput
                label={i18n.t('general:email') || ''}
                value={organization.email}
                readOnly
              />
              <FormInput
                label={i18n.t('general:phone') || ''}
                value={organization.phone}
                readOnly
              />
              <FormInput
                label={i18n.t('general:address') || ''}
                value={organization.address}
                readOnly
              />
              <hr className="border-cool-gray-200" />
              <Paragraph title={i18n.t('organization:description')}>
                {i18n.t('organization:description_placeholder')}
              </Paragraph>
              <FormTextarea
                label={i18n.t('general:description')}
                defaultValue={organization.description}
                readOnly
              />
            </FormLayout>
          </CardBody>
        </Card>
      )}
      {/* organization structure tables */}
      <Tabs<DivisionType>
        tabs={DivisionsTabs}
        onClick={onTabClick}
        defaultTab={DivisionsTabs.find((tab) => tab.key === query.type)}
      >
        {query.type === DivisionType.BRANCH && <DivisionTable type={DivisionType.BRANCH} />}
        {query.type === DivisionType.DEPARTMENT && <DivisionTable type={DivisionType.DEPARTMENT} />}
        {query.type === DivisionType.ROLE && <DivisionTable type={DivisionType.ROLE} />}
      </Tabs>
    </PageLayout>
  );
};

export default Organization;
