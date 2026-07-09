import { Queue } from 'bullmq';
import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

// Setup ioredis connection, disabling maxRetriesPerRequest as required by BullMQ
const connection = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
});

export const conversionQueue = new Queue('conversion-jobs', {
  connection,
});

export class QueueService {
  static async addJob(jobId: string, data: {
    jobId: string;
    tool: string;
    inputKey: string;
    outputKey: string;
  }) {
    await conversionQueue.add('convert', data, {
      jobId: jobId,
      removeOnComplete: true,
      removeOnFail: true,
    });
  }
}
