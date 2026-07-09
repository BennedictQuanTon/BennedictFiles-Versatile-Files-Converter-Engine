import { Router, Request, Response } from 'express';
import { prisma } from '../db/prisma';
import { StorageService } from '../services/storage';
import { EmailService } from '../services/email';
import { mockJobs } from './jobs';
import { z } from 'zod';
import path from 'path';

const router = Router();

const emailRequestSchema = z.object({
  jobId: z.string().uuid(),
  recipient: z.string().email(),
});

const mockEmailLogs: Array<{
  id: string;
  jobId: string;
  recipient: string;
  sentAt: Date;
  status: string;
}> = [];

router.post('/', async (req: Request, res: Response) => {
  try {
    const { jobId, recipient } = emailRequestSchema.parse(req.body);

    // 1. Find the job
    let job;
    let isMock = false;
    try {
      job = await prisma.job.findUnique({
        where: { id: jobId },
      });
    } catch (dbError) {
      job = mockJobs.find(j => j.id === jobId);
      isMock = true;
    }

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    if (job.status !== 'DONE') {
      return res.status(400).json({ error: 'Job is not completed yet' });
    }

    if (!job.outputKey) {
      return res.status(400).json({ error: 'Job has no output file' });
    }

    // 2. Download the output file buffer
    const fileBuffer = await StorageService.downloadFile(job.outputKey);
    const originalFileName = path.basename(job.outputKey);

    // 3. Send email
    const emailResult = await EmailService.sendFileEmail(recipient, fileBuffer, originalFileName);
    const status = emailResult.success ? 'SENT' : 'FAILED';

    // 4. Log the email
    try {
      await prisma.emailLog.create({
        data: {
          jobId,
          recipient,
          status,
        },
      });
    } catch (dbError) {
      mockEmailLogs.push({
        id: `mock-email-log-${Math.random().toString(36).substring(2, 11)}`,
        jobId,
        recipient,
        sentAt: new Date(),
        status,
      });
    }

    if (status === 'FAILED') {
      return res.status(500).json({ error: 'Failed to send email' });
    }

    return res.status(200).json({
      success: true,
      message: 'Email sent successfully with the converted file attachment.',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid jobId or email address' });
    }
    console.error('Email route error:', error);
    return res.status(500).json({ error: 'Server error sending email' });
  }
});

export default router;
export { mockEmailLogs };
