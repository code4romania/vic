import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

import i18n from '../common/config/i18n';
import { RequestStatus } from '../common/enums/request-status.enum';
import { InternalErrors } from '../common/errors/internal-errors.class';
import EmptyContent from '../components/EmptyContent';
import LoadingContent from '../components/LoadingContent';
import PageHeader from '../components/PageHeader';
import ProfileCard from '../components/ProfileCard';
import VolunteerRequest from '../components/VolunteerRequest';
import { useErrorToast } from '../hooks/useToast';
import PageLayout from '../layouts/PageLayout';
import {
  useAcceesRequestQuery,
  useRejectAccessRequestMutation,
  useApproveAccessRequestMutation,
} from '../services/volunteer/volunteer.service';
import Button from '../components/Button';
import RejectTextareaModal from '../components/RejectTextareaModal';

const AccessRequest = () => {
  const [showRejectModal, setShowRejectModal] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();

  const {
    data: accessRequest,
    error: accessRequestError,
    isLoading: isAccessRequestLoading,
  } = useAcceesRequestQuery(id as string);
  const {
    mutateAsync: rejectAccessRequestMutation,
    error: rejectAccessRequestError,
    isLoading: isRejectAccessRequestLoading,
  } = useRejectAccessRequestMutation();
  const {
    mutateAsync: approveAccessRequestMutation,
    error: approveAccessRequestError,
    isLoading: isApproveAccessRequestLoading,
  } = useApproveAccessRequestMutation();

  useEffect(() => {
    if (accessRequestError) {
      useErrorToast(
        InternalErrors.VOLUNTEER_ERRORS.getError(accessRequestError?.response?.data.code_error),
      );
    }

    if (rejectAccessRequestError) {
      useErrorToast(
        InternalErrors.VOLUNTEER_ERRORS.getError(
          rejectAccessRequestError?.response?.data.code_error,
        ),
      );
    }

    if (approveAccessRequestError) {
      useErrorToast(
        InternalErrors.VOLUNTEER_ERRORS.getError(
          approveAccessRequestError?.response?.data.code_error,
        ),
      );
    }
  }, [accessRequestError, rejectAccessRequestError, approveAccessRequestError]);

  const navigateBack = () => {
    navigate('/volunteers/requests', { replace: true });
  };

  const approveAccessRequest = () => {
    if (accessRequest) approveAccessRequestMutation(accessRequest.id);
  };

  const confirmReject = (rejectMessage?: string) => {
    if (accessRequest) rejectAccessRequestMutation({ id: accessRequest.id, rejectMessage });
    setShowRejectModal(false);
  };

  return (
    <PageLayout>
      {showRejectModal && (
        <RejectTextareaModal
          label={i18n.t('reject_modal:description')}
          title={i18n.t('reject_modal:title')}
          onClose={setShowRejectModal.bind(null, false)}
          onConfirm={confirmReject}
        />
      )}
      <PageHeader onBackButtonPress={navigateBack}>
        {i18n.t('volunteer:registration.title')}
      </PageHeader>
      {(isAccessRequestLoading ||
        isRejectAccessRequestLoading ||
        isApproveAccessRequestLoading) && <LoadingContent />}
      {accessRequest &&
        !isAccessRequestLoading &&
        !isRejectAccessRequestLoading &&
        !isApproveAccessRequestLoading && (
          <>
            {accessRequest.status === RequestStatus.PENDING && (
              <div className="flex flex-col lg:flex-row justify-between items-center py-4 px-4 gap-3 lg:gap-0 sm:px-8 overflow-hidden bg-white rounded-lg shadow-section w-full">
                <div className="flex gap-2 items-center">
                  <ExclamationTriangleIcon className="h-7 w-7 text-yellow-900 shrink-0" />
                  <h2>{i18n.t('volunteer:registration.edit_status')}</h2>
                </div>
                <div className="flex xs:flex-row flex-col gap-3 lg:gap-4 w-full xs:w-auto shrink-0">
                  <Button
                    label={i18n.t('general:reject')}
                    className="btn-danger w-full xs:w-auto"
                    icon={<XMarkIcon className="w-5 h-5" />}
                    onClick={setShowRejectModal.bind(null, true)}
                  />
                  <Button
                    label={i18n.t('general:approve')}
                    className="btn-primary w-full xs:w-auto"
                    icon={<CheckIcon className="w-5 h-5" />}
                    onClick={approveAccessRequest}
                  />
                </div>
              </div>
            )}
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
          </>
        )}
      {!accessRequest &&
        !isAccessRequestLoading &&
        !isRejectAccessRequestLoading &&
        !isAccessRequestLoading && (
          <EmptyContent description={i18n.t('general:error.load_entries')} />
        )}
    </PageLayout>
  );
};

export default AccessRequest;
