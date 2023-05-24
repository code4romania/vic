import React from 'react';
import ModalLayout from '../layouts/ModalLayout';
import i18n from '../common/config/i18n';
import OrganizationIdentity from '../components/OrganizationIdentity';
import ReadOnlyElement from '../components/ReadOnlyElement';
import FormLayout from '../layouts/FormLayout';
import { ActivityLogStatus } from '../common/enums/activity-log.status.enum';
import { Divider } from '@ui-kitten/components';
import { ButtonType } from '../common/enums/button-type.enum';
import { formatDate } from '../common/utils/utils';

const activityLog = {
  event: 'Titlu eveniment Lorem ipsum',
  task: 'Sortare de haine',
  date: `${new Date(2018, 1, 2)}`,
  hours: 5,
  mentions:
    'Fugiat ipsum ipsum deserunt culpa aute sint do nostrud anim incididunt cillum culpa consequat. Excepteur qui ipsum aliquip consequat sint. Sit id mollit nulla mollit nostrud in ea officia proident. Irure nostrud pariatur mollit ad adipisicing reprehenderit deserunt qui eu.',
  status: ActivityLogStatus.PENDING,
  rejectionReason:
    'Fugiat ipsum ipsum deserunt culpa aute sint do nostrud anim incididunt cillum culpa consequat.',
};

const ActivityLog = ({ navigation }: any) => {
  console.log('ActivityLog');

  const onEditActivityLog = () => {
    navigation.navigate('edit-activity-log');
  };

  const onDeleteActivityLog = () => {
    console.log('delete activity log');
  };

  return (
    <ModalLayout
      title={i18n.t('activity_log:log')}
      onDismiss={navigation.goBack}
      onEditButtonPress={
        activityLog.status === ActivityLogStatus.PENDING ? onEditActivityLog : undefined
      }
      actionsOptions={
        activityLog.status === ActivityLogStatus.PENDING
          ? {
              onActionLabel: i18n.t('general:delete'),
              onActionButtonClick: onDeleteActivityLog,
              buttonType: ButtonType.DANGER,
            }
          : undefined
      }
    >
      <FormLayout>
        <OrganizationIdentity uri="https://picsum.photos/200/300" name="Asociația ZEN" />
        <ReadOnlyElement
          label={i18n.t('activity_log:form.event.label')}
          value={activityLog.event}
        />
        <ReadOnlyElement label={i18n.t('activity_log:form.task.label')} value={activityLog.task} />
        <ReadOnlyElement
          label={i18n.t('activity_log:form.date.label')}
          value={formatDate(activityLog.date)}
        />
        <ReadOnlyElement
          label={i18n.t('activity_log:form.hours.label')}
          value={`${activityLog.hours}`}
        />
        <ReadOnlyElement
          label={i18n.t('activity_log:form.mentions.label')}
          value={activityLog.mentions}
        />
        {activityLog.status === ActivityLogStatus.REJECTED && (
          <>
            <Divider />
            <ReadOnlyElement
              label={i18n.t('activity_log:rejection_reason')}
              value={activityLog.rejectionReason}
            />
          </>
        )}
      </FormLayout>
    </ModalLayout>
  );
};

export default ActivityLog;
