import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
});

export const conversionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Limit each IP to 20 conversions per hour (NFR-05)
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many conversion jobs requested. Limit is 20 per hour.',
  },
});
