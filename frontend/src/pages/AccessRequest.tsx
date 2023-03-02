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
import { useErrorToast, useSuccessToast } from '../hooks/useToast';
import PageLayout from '../layouts/PageLayout';
import Button from '../components/Button';
import RejectTextareaModal from '../components/RejectTextareaModal';
import {
  useAccessRequestQuery,
  useApproveAccessRequestMutation,
  useRejectAccessRequestMutation,
} from '../services/access-requests/access-requests.service';
import Card from '../layouts/CardLayout';
import CardBody from '../components/CardBody';
import { formatDate } from '../common/utils/utils';

const AccessRequest = () => {
  // navigation state
  const navigate = useNavigate();
  const { id } = useParams();

  const [showRejectInfo, setShowRejectInfo] = useState(true);
  // modal state
  const [showRejectModal, setShowRejectModal] = useState(false);

  const {
    data: accessRequest,
    error: accessRequestError,
    isLoading: isAccessRequestLoading,
    refetch,
  } = useAccessRequestQuery(id as string);

  const { mutateAsync: rejectAccessRequestMutation, isLoading: isRejectAccessRequestLoading } =
    useRejectAccessRequestMutation();

  const { mutateAsync: approveAccessRequestMutation, isLoading: isApproveAccessRequestLoading } =
    useApproveAccessRequestMutation();

  useEffect(() => {
    if (accessRequestError) {
      useErrorToast(
        InternalErrors.ACCESS_REQUEST_ERRORS.getError(
          accessRequestError?.response?.data.code_error,
        ),
      );
    }
  }, [accessRequestError]);

  const onBackButtonPress = () => {
    navigate('/volunteers/requests', { replace: true });
  };

  const approveAccessRequest = () => {
    if (accessRequest)
      approveAccessRequestMutation(accessRequest.id, {
        onSuccess: () => {
          useSuccessToast(
            i18n.t('volunteer:registration.confirmation_message', {
              option: i18n.t('volunteer:registration.confirmation_options.approved'),
            }),
          );
          onBackButtonPress();
        },
        onError: (error) => {
          InternalErrors.ACCESS_REQUEST_ERRORS.getError(error?.response?.data.code_error);
        },
      });
  };

  const confirmReject = (rejectMessage?: string) => {
    if (accessRequest)
      rejectAccessRequestMutation(
        { id: accessRequest.id, rejectMessage },
        {
          onSuccess: () => {
            useSuccessToast(
              i18n.t('volunteer:registration.confirmation_message', {
                option: i18n.t('volunteer:registration.confirmation_options.rejected'),
              }),
            );
            refetch();
          },
          onError: (error) => {
            InternalErrors.ACCESS_REQUEST_ERRORS.getError(error?.response?.data.code_error);
          },
          onSettled: () => {
            setShowRejectModal(false);
          },
        },
      );
  };

  return (
    <PageLayout>
      <PageHeader onBackButtonPress={onBackButtonPress}>
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
            {accessRequest.status === RequestStatus.REJECTED && showRejectInfo && (
              <Card>
                <CardBody>
                  <div className="flex gap-1 sm:gap-2 items-center">
                    <XMarkIcon
                      className="w-6 h-6 text-red-600 cursor-pointer hover:text-red-300 shrink-0"
                      onClick={setShowRejectInfo.bind(null, false)}
                    />
                    <h2>
                      {i18n.t('access_requests:rejected_message', {
                        date: formatDate(accessRequest.updatedOn),
                      })}
                    </h2>
                  </div>
                  <p className="mt-2 sm:mt-4">{`${i18n.t('general:reason')}: ${
                    accessRequest.rejectionReason
                      ? accessRequest.rejectionReason
                      : i18n.t('general:unspecified').toLowerCase()
                  }`}</p>
                </CardBody>
              </Card>
            )}
            <div className="w-full flex flex-col lg:flex-row gap-4">
              <div className="w-full lg:w-1/3 xl:w-1/4">
                <ProfileCard
                  name={accessRequest.requestedBy.name}
                  birthday={accessRequest.requestedBy.birthday}
                  sex={accessRequest.requestedBy.sex}
                  location={accessRequest.requestedBy.location}
                  logo={accessRequest.requestedBy.profilePicture || ''}
                />
              </div>
              <div className="w-full lg:w-2/3 xl:w-3/4">
                <VolunteerRequest
                  email={accessRequest.requestedBy.email}
                  createdOn={accessRequest.createdOn}
                  phone={accessRequest.requestedBy.phone}
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
      {showRejectModal && (
        <RejectTextareaModal
          label={i18n.t('reject_modal:description')}
          title={i18n.t('reject_modal:title')}
          onClose={setShowRejectModal.bind(null, false)}
          onConfirm={confirmReject}
        />
      )}
    </PageLayout>
  );
};

export default AccessRequest;
