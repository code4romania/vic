import { ISendMailOptions } from '@nestjs-modules/mailer';
import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { JobCounts, Queue } from 'bull';
import { QUEUES, SENSITIVE_JOB_OPTIONS } from 'src/common/constants/constants';

// The transition emails auth:migrate composes are held in their own Bull queue, paused for every worker
// (a global pause, stored in Redis), until `announce --release-transition` resumes it after go. Until
// then nothing is sent, so restoring the snapshot on no-go leaves nobody emailed (decisions, Layer 9).
@Injectable()
export class TransitionMailService {
  constructor(
    @InjectQueue(QUEUES.AUTH_TRANSITION)
    private readonly queue: Queue<ISendMailOptions>,
  ) {}

  // Pauses the queue first, so a running API never picks a job up before the release.
  public async hold(emails: ISendMailOptions[]): Promise<number> {
    if (!emails.length) return 0;
    await this.queue.pause();
    await this.queue.addBulk(
      emails.map((data) => ({
        data,
        opts: {
          attempts: 3,
          backoff: { type: 'exponential', delay: 5000 },
          ...SENSITIVE_JOB_OPTIONS,
        },
      })),
    );
    return emails.length;
  }

  // Resumes the queue; the processor then hands the emails to the mail queue at 10 per second.
  public async release(): Promise<number> {
    const waiting = await this.queue.getWaitingCount();
    await this.queue.resume();
    return waiting;
  }

  // No-go: drops every held email. The links in them are gone with the database snapshot anyway.
  public async drop(): Promise<number> {
    const waiting = await this.queue.getWaitingCount();
    await this.queue.empty();
    return waiting;
  }

  // held: jobs not sent yet (Bull counts waiting and paused jobs together).
  public async status(): Promise<{
    paused: boolean;
    held: number;
    counts: JobCounts;
  }> {
    return {
      paused: await this.queue.isPaused(),
      held: await this.queue.getWaitingCount(),
      counts: await this.queue.getJobCounts(),
    };
  }
}
