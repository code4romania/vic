import { ExpressAdapter } from '@bull-board/express';
import { Logger, INestApplication } from '@nestjs/common';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { createBullBoard } from '@bull-board/api';
import { Queue } from 'bull';
import { QUEUES, QUEUES_TYPES } from 'src/common/constants/constants';

export function createQueueMonitoring(app: INestApplication): ExpressAdapter {
  try {
    const serverAdapter = new ExpressAdapter();
    serverAdapter.setBasePath('/admin/queues');

    createBullBoard({
      queues: [
        ...Object.keys(QUEUES).map((QUEUE: QUEUES_TYPES) => {
          const instance = app.get<Queue>(`BullQueue_${QUEUES[QUEUE]}`);
          return new BullAdapter(instance);
        }),
      ],
      serverAdapter: serverAdapter,
    });

    return serverAdapter;
  } catch (err) {
    app
      .get(Logger)
      .log('BullBoard could not be initialized', 'createQueueMonitoring');
  }
}
