import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import i18n from '../common/config/i18n';
import { InternalErrors } from '../common/errors/internal-errors.class';
import Button from '../components/Button';
import EmptyContent from '../components/EmptyContent';
import LoadingContent from '../components/LoadingContent';
import ProfileCard from '../components/ProfileCard';
import VolunteerRequest from '../components/VolunteerRequest';
import PageLayout from '../layouts/PageLayout';
import { useGetRegistrationQuery } from '../services/volunteer/volunteer.service';

const AccessRequest = () => {
  const navigate = useNavigate();
  // const { id } = useParams();

  const { data: registration, error, isLoading } = useGetRegistrationQuery('1');

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
        <h1>{i18n.t('volunteer:registration.title')}</h1>
      </div>
      {registration && (
        <div className="w-full flex flex-col lg:flex-row gap-4">
          <div className="w-full lg:w-1/3 xl:w-1/4">
            <ProfileCard
              name={registration.name}
              age={registration.age}
              sex={registration.sex}
              location={registration.location}
              logo={registration.logo}
            />
          </div>
          <div className="w-full lg:w-2/3 xl:w-3/4">
            <VolunteerRequest
              email={registration.email}
              createdOn={registration.createdOn}
              phone={registration.phone}
              answers={registration.answers}
            />
          </div>
        </div>
      )}
      {isLoading && <LoadingContent />}
      {!registration && !isLoading && (
        <EmptyContent
          description={InternalErrors.VOLUNTEER_ERRORS.getError(error?.response?.data.code_error)}
        />
      )}
    </PageLayout>
  );
};

export default AccessRequest;
