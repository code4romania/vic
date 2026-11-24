import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EVENTS } from '../constants/events.constants';
import { localized, PUSH_TITLE } from 'src/common/constants/notifications';
import { PushNotificationsFacade } from '../notifications.facade';
import { NotificationMailerService } from '../services/notification-mailer.service';
import { UserType } from 'src/modules/user/enums/user.enum';
import GenerateContractEvent from '../events/documents/generate-contract.event';
import ApproveContractEvent from '../events/documents/approve-contract.event';
import RejectContractEvent from '../events/documents/reject-contract.event';

@Injectable()
export class DocumentsListener {
  constructor(
    private readonly notificationMailer: NotificationMailerService,
    private readonly pushNotificationsFacade: PushNotificationsFacade,
  ) {}

  @OnEvent(EVENTS.DOCUMENTS.GENERATE_CONTRACT)
  async onGenerateContractEvent(payload: GenerateContractEvent): Promise<void> {
    const {
      userId,
      organizationId,
      notificationsViaPush,
      organizationName,
      contractId,
      userEmail,
      notificationsViaEmail,
      isCertificate,
    } = payload;

    if (notificationsViaPush) {
      const notificationData = {
        key: EVENTS.DOCUMENTS.GENERATE_CONTRACT,
        payload: {
          contractId,
          organizationId,
        },
      };

      this.pushNotificationsFacade.send({
        userIds: [userId],
        title: PUSH_TITLE,
        body: localized((t) =>
          t.NEW_CONTRACT.PUSH.body(organizationName, isCertificate),
        ),
        data: notificationData,
      });
    }

    if (notificationsViaEmail) {
      await this.notificationMailer.send(
        [userEmail],
        UserType.REGULAR,
        (t) => ({
          subject: t.NEW_CONTRACT.EMAIL.subject(
            organizationName,
            isCertificate,
          ),
          body: t.NEW_CONTRACT.EMAIL.body,
        }),
      );
    }
  }

  @OnEvent(EVENTS.DOCUMENTS.APPROVE_CONTRACT)
  async onApproveContractEvent(payload: ApproveContractEvent): Promise<void> {
    const {
      userId,
      organizationId,
      notificationsViaPush,
      organizationName,
      contractId,
      userEmail,
      notificationsViaEmail,
    } = payload;

    if (notificationsViaPush) {
      const notificationData = {
        key: EVENTS.DOCUMENTS.APPROVE_CONTRACT,
        payload: {
          contractId,
          organizationId,
        },
      };

      this.pushNotificationsFacade.send({
        userIds: [userId],
        title: PUSH_TITLE,
        body: localized((t) => t.APPROVE_CONTRACT.PUSH.body(organizationName)),
        data: notificationData,
      });
    }

    if (notificationsViaEmail) {
      await this.notificationMailer.send(
        [userEmail],
        UserType.REGULAR,
        (t) => ({
          subject: t.APPROVE_CONTRACT.EMAIL.subject(organizationName),
          body: t.APPROVE_CONTRACT.EMAIL.body,
        }),
      );
    }
  }

  @OnEvent(EVENTS.DOCUMENTS.REJECT_CONATRCT)
  async onRejectContractEvent(payload: RejectContractEvent): Promise<void> {
    const {
      userId,
      organizationId,
      notificationsViaPush,
      organizationName,
      contractId,
      userEmail,
      notificationsViaEmail,
      reason,
    } = payload;

    if (notificationsViaPush) {
      const notificationData = {
        key: EVENTS.DOCUMENTS.REJECT_CONATRCT,
        payload: {
          contractId,
          organizationId,
        },
      };

      this.pushNotificationsFacade.send({
        userIds: [userId],
        title: PUSH_TITLE,
        body: localized((t) =>
          t.REJECT_CONTRACT.PUSH.body(organizationName, reason),
        ),
        data: notificationData,
      });
    }

    if (notificationsViaEmail) {
      await this.notificationMailer.send(
        [userEmail],
        UserType.REGULAR,
        (t) => ({
          subject: t.REJECT_CONTRACT.EMAIL.subject(organizationName, reason),
          body: t.REJECT_CONTRACT.EMAIL.body,
        }),
      );
    }
  }
}
