import { Queue, QueueEvents } from 'bullmq';
import Redis from 'ioredis';
import { prisma } from '../db/prisma';
import { mockJobs } from '../routes/jobs';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

// Setup ioredis connection, disabling maxRetriesPerRequest as required by BullMQ
const connection = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
});

export const conversionQueue = new Queue('conversion-jobs', {
  connection,
});

// Setup QueueEvents to monitor background worker progress
export const queueEvents = new QueueEvents('conversion-jobs', {
  connection,
});

queueEvents.on('active', async ({ jobId }) => {
  console.log(`Job ${jobId} is now active (processing)...`);
  try {
    await prisma.job.update({
      where: { id: jobId },
      data: { status: 'PROCESSING' },
    });
  } catch (err) {
    const job = mockJobs.find(j => j.id === jobId);
    if (job) job.status = 'PROCESSING';
  }
});

queueEvents.on('completed', async ({ jobId, returnvalue }) => {
  console.log(`Job ${jobId} completed!`);
  try {
    const result = typeof returnvalue === 'string' ? JSON.parse(returnvalue) : returnvalue;
    await prisma.job.update({
      where: { id: jobId },
      data: {
        status: 'DONE',
        outputKey: result.outputKey,
      },
    });
  } catch (err) {
    const job = mockJobs.find(j => j.id === jobId);
    if (job) {
      job.status = 'DONE';
      try {
        const result = typeof returnvalue === 'string' ? JSON.parse(returnvalue) : returnvalue;
        job.outputKey = result.outputKey;
      } catch {}
    }
  }
});

queueEvents.on('failed', async ({ jobId, failedReason }) => {
  console.error(`Job ${jobId} failed: ${failedReason}`);
  try {
    await prisma.job.update({
      where: { id: jobId },
      data: {
        status: 'FAILED',
        errorMsg: failedReason,
      },
    });
  } catch (err) {
    const job = mockJobs.find(j => j.id === jobId);
    if (job) {
      job.status = 'FAILED';
      job.errorMsg = failedReason;
    }
  }
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
