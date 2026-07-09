import dotenv from 'dotenv';
// Load environment variables before anything else
dotenv.config();

import express from 'express';
import cors from 'cors';
import { apiLimiter } from './middleware/rateLimit';
import guestsRouter from './routes/guests';
import jobsRouter from './routes/jobs';
import filesRouter from './routes/files';
import emailRouter from './routes/email';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply general API rate limiting
app.use(apiLimiter);

// Mount routes
app.use('/guests', guestsRouter);
app.use('/jobs', jobsRouter);
app.use('/files', filesRouter);
app.use('/email', emailRouter);

// Health check
app.get('/status', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'BennedictFiles API is running',
  });
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
