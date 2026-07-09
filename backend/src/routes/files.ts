import { Router, Request, Response } from 'express';
import { StorageService } from '../services/storage';
import path from 'path';

const router = Router();

// Matches GET /files/*
router.get('/*', async (req: Request, res: Response) => {
  try {
    // req.params[0] is the path matched by '*'
    const fileKey = req.params[0];
    
    if (!fileKey) {
      return res.status(400).json({ error: 'File key is required' });
    }

    const fileBuffer = await StorageService.downloadFile(fileKey);
    const fileName = path.basename(fileKey);

    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    return res.send(fileBuffer);
  } catch (error: any) {
    console.error('File download error:', error);
    if (error.code === 'ENOENT') {
      return res.status(404).json({ error: 'File not found' });
    }
    return res.status(500).json({ error: 'Server error downloading file' });
  }
});

export default router;
