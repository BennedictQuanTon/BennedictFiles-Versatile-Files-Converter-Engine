import { Router, Request, Response } from 'express';
import { prisma } from '../db/prisma';
import { z } from 'zod';

const router = Router();

const guestSchema = z.object({ email: z.string().email() });

// In-memory mock database for fallback
const mockGuests: Array<{ id: string; email: string; createdAt: Date }> = [];

router.post('/', async (req: Request, res: Response) => {
  try {
    const { email } = guestSchema.parse(req.body);

    let guest;
    try {
      guest = await prisma.guest.upsert({
        where: { email },
        update: {},
        create: { email },
      });
    } catch (dbError) {
      console.warn('Database error, using mock fallback for guests:', dbError);
      let existingMock = mockGuests.find(g => g.email === email);
      if (!existingMock) {
        existingMock = {
          id: `mock-guest-${Math.random().toString(36).substr(2, 9)}`,
          email,
          createdAt: new Date(),
        };
        mockGuests.push(existingMock);
      }
      guest = existingMock;
    }

    return res.status(200).json({
      success: true,
      guest,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid email address' });
    }
    console.error('Guest route error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

export default router;
export { mockGuests };
