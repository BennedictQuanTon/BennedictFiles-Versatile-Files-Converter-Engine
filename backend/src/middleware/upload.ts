import multer from 'multer';

// Use memory storage to process files as buffers
const storage = multer.memoryStorage();

const maxFileSizeMB = parseInt(process.env.MAX_FILE_SIZE_MB || '50', 10);

export const upload = multer({
  storage: storage,
  limits: {
    fileSize: maxFileSizeMB * 1024 * 1024, // 50MB limit
  },
});
