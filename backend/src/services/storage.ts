import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const bucketName = process.env.SUPABASE_STORAGE_BUCKET || 'conversions';

const supabase = supabaseUrl && supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey) 
  : null;

// Local fallback directory
const LOCAL_STORAGE_DIR = path.join(__dirname, '../../../uploads');
if (!fs.existsSync(LOCAL_STORAGE_DIR)) {
  fs.mkdirSync(LOCAL_STORAGE_DIR, { recursive: true });
}

export class StorageService {
  static async uploadFile(fileBuffer: Buffer, fileName: string, mimeType: string): Promise<string> {
    if (supabase) {
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(fileName, fileBuffer, { contentType: mimeType, upsert: true });
      if (error) {
        console.error('Supabase upload failed, fallback to local:', error.message);
      } else {
        return data.path;
      }
    }

    // Local fallback
    const filePath = path.join(LOCAL_STORAGE_DIR, fileName);
    await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
    await fs.promises.writeFile(filePath, fileBuffer);
    return fileName;
  }

  static async downloadFile(fileKey: string): Promise<Buffer> {
    if (supabase) {
      try {
        const { data, error } = await supabase.storage
          .from(bucketName)
          .download(fileKey);
        if (error) throw error;
        const arrayBuffer = await data.arrayBuffer();
        return Buffer.from(arrayBuffer);
      } catch (err: any) {
        console.error('Supabase download failed, checking local:', err.message);
      }
    }

    const filePath = path.join(LOCAL_STORAGE_DIR, fileKey);
    return fs.promises.readFile(filePath);
  }

  static async getSignedUrl(fileKey: string): Promise<string> {
    if (supabase) {
      try {
        const { data, error } = await supabase.storage
          .from(bucketName)
          .createSignedUrl(fileKey, 3600); // 1 hour
        if (error) throw error;
        return data.signedUrl;
      } catch (err: any) {
        console.error('Supabase signed URL failed, fallback to local URL:', err.message);
      }
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    return `${apiUrl}/files/${fileKey}`;
  }
}
