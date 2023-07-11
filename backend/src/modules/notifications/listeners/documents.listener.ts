import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EVENTS } from '../constants/events.constants';
import { NOTIFICATIONS } from 'src/common/constants/notifications';
import { PushNotificationsFacade } from '../notifications.facade';
import { MailService } from 'src/modules/mail/services/mail.service';
import GenerateContractEvent from '../events/documents/generate-contract.event';
import ApproveContractEvent from '../events/documents/approve-contract.event';
import RejectContractEvent from '../events/documents/reject-contract.event';

@Injectable()
export class DocumentsListener {
  constructor(
    private readonly mailService: MailService,
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
        title: NOTIFICATIONS.NEW_CONTRACT.PUSH.title,
        body: NOTIFICATIONS.NEW_CONTRACT.PUSH.body(organizationName),
        data: notificationData,
      });
    }

    if (notificationsViaEmail) {
      // 4. Send mail to user with link to the volunteer profile for the organization
      await this.mailService.sendEmail({
        to: userEmail,
        subject: NOTIFICATIONS.NEW_CONTRACT.EMAIL.subject(organizationName),
        context: {
          title: NOTIFICATIONS.NEW_CONTRACT.EMAIL.subject(organizationName),
          subtitle: NOTIFICATIONS.NEW_CONTRACT.EMAIL.body,
        },
      });
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
        title: NOTIFICATIONS.APPROVE_CONTRACT.PUSH.title,
        body: NOTIFICATIONS.APPROVE_CONTRACT.PUSH.body(organizationName),
        data: notificationData,
      });
    }

    if (notificationsViaEmail) {
      // 4. Send mail to user with link to the volunteer profile for the organization
      await this.mailService.sendEmail({
        to: userEmail,
        subject: NOTIFICATIONS.APPROVE_CONTRACT.EMAIL.subject(organizationName),
        context: {
          title: NOTIFICATIONS.APPROVE_CONTRACT.EMAIL.subject(organizationName),
          subtitle: NOTIFICATIONS.APPROVE_CONTRACT.EMAIL.body,
        },
      });
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
        title: NOTIFICATIONS.REJECT_CONTRACT.PUSH.title,
        body: NOTIFICATIONS.REJECT_CONTRACT.PUSH.body(organizationName, reason),
        data: notificationData,
      });
    }

    if (notificationsViaEmail) {
      // 4. Send mail to user with link to the volunteer profile for the organization
      await this.mailService.sendEmail({
        to: userEmail,
        subject: NOTIFICATIONS.REJECT_CONTRACT.EMAIL.subject(
          organizationName,
          reason,
        ),
        context: {
          title: NOTIFICATIONS.REJECT_CONTRACT.EMAIL.subject(
            organizationName,
            reason,
          ),
          subtitle: NOTIFICATIONS.REJECT_CONTRACT.EMAIL.body,
        },
      });
    }
  }
}
