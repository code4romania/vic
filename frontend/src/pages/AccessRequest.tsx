import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import i18n from '../common/config/i18n';
import Button from '../components/Button';
import EmptyContent from '../components/EmptyContent';
import LoadingContent from '../components/LoadingContent';
import ProfileCard from '../components/ProfileCard';
import VolunteerRequest from '../components/VolunteerRequest';
import { useErrorToast } from '../hooks/useToast';
import PageLayout from '../layouts/PageLayout';
import { useGetRegistrationQuery } from '../services/volunteer/volunteer.service';

const AccessRequest = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const { data: registration, error, isLoading } = useGetRegistrationQuery(id as string);

  useEffect(() => {
    if (error) useErrorToast('');
  }, [error]);

  const navigateBack = () => {
    navigate(-1);
  };

  return (
    <PageLayout>
      <div className="flex sm:flex-row flex-col gap-4">
        <Button
          label={i18n.t('general:back')}
          icon={<ChevronLeftIcon className="-ml-1 mr-2 sm:h-5 sm:w-5 h-4 w-4" aria-hidden="true" />}
          className="btn-secondary"
          type="button"
          onClick={navigateBack}
        />
        <h1>{i18n.t('registration:title')}</h1>
      </div>
      {registration && !isLoading && (
        <div className="grid lg:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
          <div>
            <ProfileCard
              name={registration.name}
              age={registration.age}
              sex={registration.sex}
              location={registration.location}
              logo={registration.logo}
            />
          </div>
          <div className="lg:col-span-2 xl:col-span-4 2xl:col-span-5">
            <VolunteerRequest
              email={registration.email}
              createdOn={registration.createdOn}
              phone={registration.phone}
              answers={registration.answers}
            />
          </div>
        </div>
      )}
      {!registration && !isLoading && (
        <EmptyContent description={i18n.t('registration:error.loading')} />
      )}
      {isLoading && <LoadingContent />}
    </PageLayout>
  );
};

export default AccessRequest;
