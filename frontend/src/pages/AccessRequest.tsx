import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import i18n from '../common/config/i18n';
import { InternalErrors } from '../common/errors/internal-errors.class';
import EmptyContent from '../components/EmptyContent';
import LoadingContent from '../components/LoadingContent';
import PageHeader from '../components/PageHeader';
import ProfileCard from '../components/ProfileCard';
import VolunteerRequest from '../components/VolunteerRequest';
import { useErrorToast } from '../hooks/useToast';
import PageLayout from '../layouts/PageLayout';
import { useAcceesRequestQuery } from '../services/volunteer/volunteer.service';

const AccessRequest = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const { data: accessRequest, error, isLoading } = useAcceesRequestQuery(id as string);

  useEffect(() => {
    if (error) {
      useErrorToast(InternalErrors.VOLUNTEER_ERRORS.getError(error?.response?.data.code_error));
    }
  }, [error]);

  const onBackButtonPress = () => {
    navigate('/volunteers/requests', { replace: true });
  };

  return (
    <PageLayout>
      <PageHeader onBackButtonPress={onBackButtonPress}>
        {i18n.t('volunteer:registration.title')}
      </PageHeader>
      {isLoading && <LoadingContent />}
      {accessRequest && !isLoading && (
        <div className="w-full flex flex-col lg:flex-row gap-4">
          <div className="w-full lg:w-1/3 xl:w-1/4">
            <ProfileCard
              name={accessRequest.name}
              age={accessRequest.age}
              sex={accessRequest.sex}
              location={accessRequest.location}
              logo={accessRequest.logo}
            />
          </div>
          <div className="w-full lg:w-2/3 xl:w-3/4">
            <VolunteerRequest
              email={accessRequest.email}
              createdOn={accessRequest.createdOn}
              phone={accessRequest.phone}
              answers={accessRequest.answers}
            />
          </div>
        </div>
      )}
      {!accessRequest && !isLoading && (
        <EmptyContent description={i18n.t('general:error.load_entries')} />
      )}
    </PageLayout>
  );
};

export default AccessRequest;
